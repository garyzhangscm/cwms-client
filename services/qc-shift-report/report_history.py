"""Read-only provenance from durable QC history, never from time/LPN guesses."""
from collections import defaultdict


def classify(rows, origins):
    by_inventory = defaultdict(list)
    for source in origins:
        by_inventory[(source['warehouseId'], source['inventoryId'])].append(source)
    evidence = {}
    for row in rows:
        inventory_id, request_id = row.get('inventoryId'), row.get('qcRequestId')
        if (row.get('lpn') or row.get('workOrderId') is not None
                or not isinstance(inventory_id, int) or inventory_id <= 0
                or not isinstance(request_id, int) or request_id <= 0):
            continue
        prior = [s for s in by_inventory[(row['warehouseId'], inventory_id)]
                 if s['originTime'] <= row['timestamp'] and s['originRequestId'] != request_id]
        # Contradictory production evidence must not silently become receiving QC.
        if any(s.get('workOrderId') is not None or s.get('sampleId') is not None
               or s.get('originType') == 'BY_WORK_ORDER_SAMPLING' for s in prior):
            continue
        inbound = [s for s in prior if s.get('originType') == 'INBOUND_BY_INVENTORY']
        if not inbound:
            continue
        original = min(inbound, key=lambda s: (s['originTime'], s['originRequestId']))
        evidence[(request_id, inventory_id)] = dict(qcRequestId=request_id,
            inventoryId=inventory_id, sourceQcRequestId=original['originRequestId'],
            sourceType='INBOUND_BY_INVENTORY')
    return evidence


def resolve_historical_receipts(cursor, warehouse_id, rows):
    missing = [r for r in rows if not r.get('lpn') and r.get('workOrderId') is None
               and isinstance(r.get('inventoryId'), int) and r['inventoryId'] > 0]
    if not missing:
        return {}
    if any(r.get('warehouseId') != warehouse_id for r in missing):
        raise ValueError('Historical QC warehouse mismatch')
    identities = tuple(sorted({r['inventoryId'] for r in missing}))
    if len(identities) > 500:
        raise ValueError('Too many unresolved historical inventory links')
    # INBOUND_BY_INVENTORY is created only when the source inventory has a
    # receipt. Its inventory ID survives receiving reversal in the QC record.
    # Read every earlier request for these IDs so conflicting evidence is retained.
    cursor.execute('''SELECT q.qc_inspection_request_id originRequestId,
        q.warehouse_id warehouseId,q.inventory_id inventoryId,q.created_time originTime,
        q.qc_inspection_request_type originType,q.work_order_id workOrderId,
        q.work_order_qc_sample_id sampleId
        FROM qc_inspection_request q WHERE q.warehouse_id=%s AND q.inventory_id IN %s
        AND q.created_time <= %s LIMIT 25001''',
        (warehouse_id, identities, max(r['timestamp'] for r in missing)))
    origins = list(cursor.fetchall())
    if len(origins) > 25000:
        raise ValueError('Too many historical source records; no partial result returned')
    return classify(missing, origins)
