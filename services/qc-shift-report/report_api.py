"""Read-only shift report service. Authenticate through the existing MES gateway.

No migrations, JPA initializers, schedules or business mutations. Database credentials
must be provisioned separately; they are never discovered from other services.
"""
import hashlib
import base64
import json
import logging
import os
import re
import secrets
import threading
import time
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit

from report_pdf import pdf_bytes
from report_history import resolve_historical_receipts
from report_core import aggregate, excel_bytes, shift_bounds, range_bounds, normalize_schedule, inspector_username, attach_inspection_details

LOG = logging.getLogger('qc-shift-report')
SLOTS = threading.BoundedSemaphore(3)
CACHE = {}
CACHE_LOCK = threading.Lock()


class ReportError(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message


def positive(value):
    if not isinstance(value, (str, int)) or not re.fullmatch(r'[1-9][0-9]{0,17}', str(value)):
        raise ReportError(400, 'Invalid scope')
    return int(value)


def authorize(header, company_id, warehouse_id):
    import requests
    if not header or not header.startswith('Bearer ') or len(header) > 10000:
        raise ReportError(401, 'Sign in to MES')
    try:
        payload=header[7:].split('.')[1]
        claims=json.loads(base64.urlsafe_b64decode(payload+'='*(-len(payload)%4)))
        if (not isinstance(claims.get('sub'),str) or not claims['sub'].strip()
                or type(claims.get('companyId')) is not int or claims['companyId'] not in (company_id,-1)
                or type(claims.get('exp')) not in (int,float) or claims['exp']<=time.time()):
            raise ValueError()
    except (ValueError,KeyError,TypeError,IndexError):
        raise ReportError(401, 'Sign in with a valid account') from None
    gateway = os.environ.get('QC_GATEWAY_URL', '').rstrip('/')
    if not gateway:
        raise ReportError(503, 'Report authentication is not configured')
    query = urlencode(dict(companyId=company_id, warehouseId=warehouse_id))
    response = requests.get(gateway + '/resource/site-information?' + query,
                            # The gateway verifies the unchanged bearer token. Legacy Resource
                            # reads the username header; derive it only from that same token,
                            # never from a caller-supplied username. Recheck identity below.
                            headers={'Authorization': header, 'username': claims['sub'],
                                     'companyId': str(company_id), 'warehouseId': str(warehouse_id)},
                            timeout=10, allow_redirects=False)
    if response.status_code != 200:
        raise ReportError(403, 'MES access could not be verified')
    body = response.json()
    info = body.get('data') if body.get('result') == 0 else None
    user = info.get('user') if isinstance(info, dict) else None
    if not isinstance(user, dict) or not user.get('id') or not user.get('username'):
        raise ReportError(403, 'MES access could not be verified')
    # Claims constrain tenant/identity only after the existing gateway verifies the signature.
    if user['username'].casefold()!=claims['sub'].casefold() or (claims['companyId']==-1 and user.get('systemAdmin') is not True):
        raise ReportError(403, 'MES identity could not be verified')
    admin = user.get('systemAdmin') is True or user.get('admin') is True
    if user.get('systemAdmin') is not True and user.get('companyId') != company_id:
        raise ReportError(403, 'Company access denied')

    def permits(entries):
        for entry in entries:
            if entry.get('hide') or entry.get('disabled'):
                continue
            if entry.get('link') == '/qc/result' or permits(entry.get('children') or []):
                return True
        return False
    if not admin and not permits(info.get('menu') or []):
        raise ReportError(403, 'QC result permission required')
    # Same login, company and warehouse are required when exporting a saved snapshot.
    return hashlib.sha256(f'{header}|{company_id}|{warehouse_id}'.encode()).hexdigest()


@contextmanager
def database():
    import pymysql
    required = ['QC_DB_HOST', 'QC_DB_NAME', 'QC_DB_USER', 'QC_DB_PASSWORD_FILE']
    if not all(os.environ.get(name) for name in required):
        raise ReportError(503, 'The report data connection has not been configured')
    password_file = Path(os.environ['QC_DB_PASSWORD_FILE'])
    if password_file.stat().st_mode & 0o077:
        raise ReportError(503, 'The report credential file must be private')
    connection = pymysql.connect(host=os.environ['QC_DB_HOST'], port=int(os.environ.get('QC_DB_PORT', '3306')),
                                 user=os.environ['QC_DB_USER'], password=password_file.read_text().rstrip('\r\n'),
                                 database=os.environ['QC_DB_NAME'], charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor, connect_timeout=5,
                                 read_timeout=20, write_timeout=5, autocommit=False)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SET time_zone = '+00:00'")
            cursor.execute('SET SESSION MAX_EXECUTION_TIME=15000')
            cursor.execute('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ')
            cursor.execute('SET SESSION TRANSACTION READ ONLY')
            cursor.execute('START TRANSACTION WITH CONSISTENT SNAPSHOT')
            yield cursor
    finally:
        connection.rollback()
        connection.close()


def load_warehouse_timezone(cursor, company_id, warehouse_id):
    cursor.execute('''SELECT w.company_id, wc.time_zone FROM warehouse w
        LEFT JOIN warehouse_configuration wc ON wc.warehouse_id=w.warehouse_id
        WHERE w.warehouse_id=%s''', (warehouse_id,))
    scope = cursor.fetchall()
    if len(scope) != 1 or scope[0]['company_id'] != company_id:
        raise ReportError(403, 'Warehouse access denied')
    zone = scope[0].get('time_zone') or json.loads(os.environ.get('QC_SITE_TIMEZONES', '{}')).get(str(warehouse_id))
    if not zone:
        raise ReportError(503, 'Warehouse timezone is required')
    # Validate the configured zone before using it for a query.
    from zoneinfo import ZoneInfo
    ZoneInfo(zone)
    return zone


def load_shift_configuration(cursor, company_id, warehouse_id):
    zone = load_warehouse_timezone(cursor, company_id, warehouse_id)
    cursor.execute('''SELECT production_shift_schedule_id id, shift_start_time start,
        shift_end_time end, shift_end_next_day nextDay FROM production_shift_schedule
        WHERE warehouse_id=%s ORDER BY shift_start_time, production_shift_schedule_id''', (warehouse_id,))
    try:
        schedules = sorted([normalize_schedule(row) for row in cursor.fetchall()], key=lambda row: (row['start'], row['id']))
        if not schedules or len({row['id'] for row in schedules}) != len(schedules):
            raise ValueError()
    except (ValueError, KeyError, TypeError):
        raise ReportError(503, 'Production shift configuration is missing or invalid; check Work Order Configuration') from None
    return dict(warehouseId=warehouse_id, timezone=zone, shifts=schedules)


def query_shifts(company_id, warehouse_id):
    with database() as cursor:
        return load_shift_configuration(cursor, company_id, warehouse_id)


def parse_family_ids(value):
    if value is None:
        return ()
    if not isinstance(value, str) or len(value) > 2000:
        raise ReportError(400, 'Invalid item family filter')
    parts = value.split(',')
    if not 1 <= len(parts) <= 100:
        raise ReportError(400, 'Select at most 100 item families')
    return tuple(sorted({positive(part) for part in parts}))


def query_report(company_id, warehouse_id, day=None, shift=None, *, start_local=None, end_local=None, item_family_ids=None):
    families = parse_family_ids(item_family_ids)
    custom = start_local is not None or end_local is not None
    if custom and (day is not None or shift is not None):
        raise ReportError(400, 'Choose either a shift or a custom range')
    if not custom:
        positive(shift)
    with database() as cursor:
        if custom:
            zone = load_warehouse_timezone(cursor, company_id, warehouse_id)
            try:
                start, end = range_bounds(start_local, end_local, zone)
            except ValueError as error:
                raise ReportError(400, str(error)) from None
            day, schedule = start_local[:10], None
        else:
            config = load_shift_configuration(cursor, company_id, warehouse_id)
            zone = config['timezone']
            schedule = next((row for row in config['shifts'] if row['id'] == str(shift)), None)
            if schedule is None:
                raise ReportError(409, 'Shift configuration changed; reload the report page')
            start, end = shift_bounds(day, schedule, zone)
        family_names = []
        if families:
            cursor.execute('''SELECT item_family_id id,name FROM item_family
                WHERE company_id=%s AND (warehouse_id IS NULL OR warehouse_id=%s)
                  AND item_family_id IN %s LIMIT 101''', (company_id, warehouse_id, families))
            choices = list(cursor.fetchall())
            if {row['id'] for row in choices} != set(families):
                raise ReportError(403, 'Item family is unavailable in this company or warehouse')
            family_names = [row['name'] for row in sorted(choices, key=lambda row: row['id'])]
        params = dict(warehouse=warehouse_id, start=start.replace(tzinfo=None), end=end.replace(tzinfo=None))

        def load(sql):
            cursor.execute(sql + ' LIMIT 25001', params)
            records = list(cursor.fetchall())
            if len(records) > 25000:
                raise ReportError(503, 'Too many report records; no partial result returned')
            return records

        # Sample registrations are the first-sample workflow. Include historical removed
        # references: replacing today's active sample must not erase yesterday's count.
        samples = load('''SELECT CONCAT('sample:',s.work_order_qc_sample_id) id,
            s.number,s.created_by username,wo.number workOrderNumber,
            s.warehouse_id warehouseId, s.created_time timestamp, i.name product,i.item_family_id itemFamilyId, pl.name machine
            FROM work_order_qc_sample s
            LEFT JOIN production_line_assignment a ON a.production_line_assignment_id=s.production_line_assignment_id
            LEFT JOIN work_order wo ON wo.work_order_id=COALESCE(s.work_order_id,a.work_order_id) AND wo.warehouse_id=s.warehouse_id
            LEFT JOIN item i ON i.item_id=wo.item_id
            LEFT JOIN production_line pl ON pl.production_line_id=COALESCE(s.production_line_id,a.production_line_id)
            WHERE s.warehouse_id=%(warehouse)s AND s.created_time >= %(start)s AND s.created_time < %(end)s''')
        inline = load('''SELECT CONCAT('request:',q.qc_inspection_request_id) id,
            q.number,q.qc_username username,wo.number workOrderNumber,
            q.warehouse_id warehouseId,q.qc_time timestamp,q.qc_inspection_result status,i.name product,i.item_family_id itemFamilyId,pl.name machine
            FROM qc_inspection_request q
            LEFT JOIN work_order_qc_sample s ON s.work_order_qc_sample_id=q.work_order_qc_sample_id AND s.warehouse_id=q.warehouse_id
            LEFT JOIN production_line_assignment a ON a.production_line_assignment_id=s.production_line_assignment_id
            LEFT JOIN work_order wo ON wo.work_order_id=COALESCE(s.work_order_id,a.work_order_id) AND wo.warehouse_id=q.warehouse_id
            LEFT JOIN item i ON i.item_id=wo.item_id
            LEFT JOIN production_line pl ON pl.production_line_id=COALESCE(s.production_line_id,a.production_line_id)
            WHERE q.warehouse_id=%(warehouse)s AND q.qc_time >= %(start)s AND q.qc_time < %(end)s
              AND (q.qc_inspection_request_type='BY_WORK_ORDER_SAMPLING'
                   OR (q.qc_inspection_request_type IS NULL AND q.work_order_qc_sample_id IS NOT NULL))
              AND q.qc_inspection_result IN ('PASS','FAIL')''')
        legacy = load('''SELECT CONCAT('legacy:',q.work_order_qc_result_id) id,
            q.number,q.qc_username username,wo.number workOrderNumber,
            q.warehouse_id warehouseId,q.qc_time timestamp,q.qc_inspection_result status,i.name product,i.item_family_id itemFamilyId,pl.name machine
            FROM work_order_qc_result q
            LEFT JOIN work_order_qc_sample s ON s.work_order_qc_sample_id=q.work_order_qc_sample_id AND s.warehouse_id=q.warehouse_id
            LEFT JOIN production_line_assignment a ON a.production_line_assignment_id=s.production_line_assignment_id
            LEFT JOIN work_order wo ON wo.work_order_id=COALESCE(s.work_order_id,a.work_order_id) AND wo.warehouse_id=q.warehouse_id
            LEFT JOIN item i ON i.item_id=wo.item_id
            LEFT JOIN production_line pl ON pl.production_line_id=COALESCE(s.production_line_id,a.production_line_id)
            WHERE q.warehouse_id=%(warehouse)s AND q.qc_time >= %(start)s AND q.qc_time < %(end)s
              AND q.qc_inspection_result IN ('PASS','FAIL')''')
        # Legacy qc_time is LocalDateTime.now(), not a UTC audit timestamp. Refuse to
        # mix unverified timestamps into a shift if historical legacy rows are present.
        if legacy and os.environ.get('QC_LEGACY_TIMEZONE') != 'UTC':
            raise ReportError(503, 'Legacy QC timestamp timezone requires verification')
        produced = load('''SELECT t.warehouse_id warehouseId,t.created_time timestamp,p.lpn,i.name product,i.item_family_id itemFamilyId,pl.name machine
            FROM work_order_produce_transaction t
            JOIN work_order_produced_inventory p ON p.work_order_produce_transaction_id=t.work_order_produce_transaction_id
            LEFT JOIN work_order wo ON wo.work_order_id=t.work_order_id AND wo.warehouse_id=t.warehouse_id
            LEFT JOIN item i ON i.item_id=wo.item_id
            LEFT JOIN production_line pl ON pl.production_line_id=t.production_line_id
            WHERE t.warehouse_id=%(warehouse)s AND t.created_time >= %(start)s AND t.created_time < %(end)s
              AND p.quantity > COALESCE((SELECT SUM(r.quantity) FROM work_order_reversed_production_inventory r
                WHERE r.work_order_produce_transaction_id=t.work_order_produce_transaction_id AND r.lpn=p.lpn),0)''')
        finished = load('''SELECT DISTINCT q.qc_inspection_request_id qcRequestId,link.inventory_id inventoryId,
            q.warehouse_id warehouseId,q.qc_time timestamp,
            q.qc_inspection_result status, inv.lpn,
            COALESCE(q.work_order_id,inv.work_order_id) workOrderId
            FROM qc_inspection_request q
            LEFT JOIN (SELECT l.qc_inspection_request_id,l.inventory_id FROM qc_inspection_request_inventory l
                  JOIN qc_inspection_request r ON r.qc_inspection_request_id=l.qc_inspection_request_id
                  WHERE r.warehouse_id=%(warehouse)s AND r.qc_time >= %(start)s AND r.qc_time < %(end)s
                  UNION SELECT qc_inspection_request_id,inventory_id FROM qc_inspection_request
                  WHERE warehouse_id=%(warehouse)s AND qc_time >= %(start)s AND qc_time < %(end)s AND inventory_id IS NOT NULL) link
              ON link.qc_inspection_request_id=q.qc_inspection_request_id
            LEFT JOIN inventory inv ON inv.inventory_id=link.inventory_id AND inv.warehouse_id=q.warehouse_id
            WHERE q.warehouse_id=%(warehouse)s AND q.qc_time >= %(start)s AND q.qc_time < %(end)s
              AND q.qc_inspection_result IN ('PASS','FAIL')
              AND (q.qc_inspection_request_type IN ('BY_INVENTORY','MANUAL_BY_INVENTORY')
                   OR (q.qc_inspection_request_type IS NULL AND q.work_order_qc_sample_id IS NULL
                       AND (q.inventory_id IS NOT NULL OR link.inventory_id IS NOT NULL)))
              AND (COALESCE(q.work_order_id,inv.work_order_id) IS NOT NULL OR inv.inventory_id IS NULL)''')
        receiving_history = resolve_historical_receipts(cursor, warehouse_id, finished)
        excluded_receiving = {r['qcRequestId'] for r in finished if (r.get('qcRequestId'), r.get('inventoryId')) in receiving_history
                              and not r.get('lpn') and r.get('workOrderId') is None}
        finished = [r for r in finished if not ((r.get('qcRequestId'), r.get('inventoryId')) in receiving_history
                    and not r.get('lpn') and r.get('workOrderId') is None)]
        # Resolve only inspected LPNs against their original work orders. This avoids
        # repeating a full historical production join for every inspected pallet.
        workorders = tuple(sorted({r['workOrderId'] for r in finished if r.get('workOrderId') is not None}))
        lpns = tuple(sorted({r['lpn'] for r in finished if r.get('lpn')}))
        mappings = []
        if workorders and lpns:
            lookup = dict(params, workorders=workorders, lpns=lpns)
            cursor.execute('''SELECT t.warehouse_id warehouseId,t.work_order_id workOrderId,
                t.created_time producedTime,p.lpn,i.name product,i.item_family_id itemFamilyId,pl.name machine
                FROM work_order_produce_transaction t
                JOIN work_order_produced_inventory p ON p.work_order_produce_transaction_id=t.work_order_produce_transaction_id
                LEFT JOIN work_order wo ON wo.work_order_id=t.work_order_id AND wo.warehouse_id=t.warehouse_id
                LEFT JOIN item i ON i.item_id=wo.item_id
                LEFT JOIN production_line pl ON pl.production_line_id=t.production_line_id
                WHERE t.warehouse_id=%(warehouse)s AND t.work_order_id IN %(workorders)s
                  AND p.lpn IN %(lpns)s AND t.created_time < %(end)s LIMIT 25001''', lookup)
            mappings = list(cursor.fetchall())
            if len(mappings) > 25000:
                raise ReportError(503, 'Too many report records; no partial result returned')
        by_pallet = {}
        for row in mappings:
            by_pallet.setdefault((row['warehouseId'], row['workOrderId'], row['lpn']), []).append(row)
        for row in finished:
            candidates = {(m['product'], m['machine'], m.get('itemFamilyId')) for m in by_pallet.get(
                (row['warehouseId'], row.get('workOrderId'), row.get('lpn')), [])
                if m['producedTime'] <= row['timestamp']}
            if len(candidates) != 1:
                raise ReportError(503, 'Missing or ambiguous original production mapping')
            row['product'], row['machine'], row['itemFamilyId'] = next(iter(candidates))
        if families:
            samples, inline, legacy, produced, finished = [
                [row for row in rows if row.get('itemFamilyId') in families]
                for rows in (samples, inline, legacy, produced, finished)]
        people = sorted({name.casefold() for r in samples + inline + legacy
                         if (name := inspector_username(r.get('username')))})
        users, ambiguous = {}, set()
        for offset in range(0, len(people), 500):
            cursor.execute('''SELECT username,first_name,last_name FROM user_info
                WHERE company_id=%s AND LOWER(TRIM(username)) IN %s LIMIT 25001''',
                           (company_id, tuple(people[offset:offset + 500])))
            matches = list(cursor.fetchall())
            if len(matches) > 25000:
                raise ReportError(503, 'Too many user matches')
            for person in matches:
                key = person['username'].strip().casefold()
                name = ' '.join(str(person.get(f) or '').strip() for f in ('first_name', 'last_name')).strip()
                if key in users and users[key] != name:
                    ambiguous.add(key)
                users[key] = name
        for key in ambiguous:
            users.pop(key, None)  # Keep recorded username when a full name is ambiguous.
        report = aggregate(warehouse_id, day, schedule, zone, samples, inline + legacy, produced, finished,
                           bounds=(start, end) if custom else None)
        report['itemFamilyIds'] = list(families)
        report['itemFamilyNames'] = family_names
        if excluded_receiving:
            report['warnings'].append(f'{len(excluded_receiving)} historical receiving inspection(s) excluded from production finished-goods totals.')
            report['excludedReceivingInspections'] = len(excluded_receiving)
        return attach_inspection_details(report, samples, inline + legacy, users)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log Authorization, query strings, source data or credential errors.

    def respond(self, status, payload, content_type='application/json'):
        raw = json.dumps(payload).encode() if content_type == 'application/json' else payload
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if content_type != 'application/json':
            extension = 'pdf' if content_type == 'application/pdf' else 'xlsx'
            self.send_header('Content-Disposition', f'attachment; filename="QC_shift_report.{extension}"')
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def handle_request(self, method):
        path = urlsplit(self.path)
        if method == 'GET' and path.path == '/qc-shift-report/health':
            self.respond(200, dict(result=0, data={'service': 'qc-shift-report', 'readOnly': True}))
            return
        try:
            if method == 'GET' and path.path in ('/qc-shift-report/report', '/qc-shift-report/shifts'):
                values = parse_qs(path.query, keep_blank_values=True)
                expected = {'companyId', 'warehouseId'} if path.path.endswith('/shifts') else {'companyId', 'warehouseId', 'date', 'shift'}
                custom = {'companyId', 'warehouseId', 'startLocal', 'endLocal'}
                keys = set(values) - ({'itemFamilyIds'} if path.path.endswith('/report') else set())
                if (keys != expected and not (path.path.endswith('/report') and keys == custom)) or any(len(v) != 1 for v in values.values()):
                    raise ReportError(400, 'Invalid report parameters')
                request = {k: v[0] for k, v in values.items()}
            elif method == 'POST' and path.path in ('/qc-shift-report/export', '/qc-shift-report/export-pdf'):
                length = int(self.headers.get('Content-Length', '0'))
                if not 0 < length <= 2048:
                    raise ReportError(400, 'Invalid export request')
                request = json.loads(self.rfile.read(length))
                if not isinstance(request, dict) or set(request) != {'companyId', 'warehouseId', 'snapshotId'}:
                    raise ReportError(400, 'Invalid export request')
            else:
                raise ReportError(404, 'Not found')
            company = positive(request.get('companyId'))
            warehouse = positive(request.get('warehouseId'))
            owner = authorize(self.headers.get('Authorization'), company, warehouse)
            if method == 'POST':
                with CACHE_LOCK:
                    cached = CACHE.get(request.get('snapshotId'))
                if not cached or cached[0] < time.monotonic() or cached[1] != owner:
                    raise ReportError(409, 'Saved result expired or inaccessible; run the report again')
                if not SLOTS.acquire(blocking=False):
                    raise ReportError(429, 'Report service is busy; try again')
                try:
                    if path.path.endswith('/export-pdf'):
                        self.respond(200, pdf_bytes(cached[2]), 'application/pdf')
                    else:
                        self.respond(200, excel_bytes(cached[2]), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                finally:
                    SLOTS.release()
                return
            if not SLOTS.acquire(blocking=False):
                raise ReportError(429, 'Report service is busy; try again')
            try:
                if path.path.endswith('/shifts'):
                    self.respond(200, dict(result=0, data=query_shifts(company, warehouse)))
                    return
                filters = {'item_family_ids': request['itemFamilyIds']} if 'itemFamilyIds' in request else {}
                if 'startLocal' in request:
                    report = query_report(company, warehouse, start_local=request['startLocal'], end_local=request['endLocal'], **filters)
                else:
                    report = query_report(company, warehouse, request['date'], request['shift'], **filters)
            finally:
                SLOTS.release()
            report['snapshotId'] = secrets.token_urlsafe(24)
            snapshot_size = len(json.dumps(report).encode())
            if snapshot_size > 64 * 1024 * 1024:
                raise ReportError(503, 'Report details exceed the snapshot size limit')
            with CACHE_LOCK:
                now = time.monotonic()
                for key in list(CACHE):
                    if CACHE[key][0] < now:
                        del CACHE[key]
                if len(CACHE) >= 100:
                    del CACHE[min(CACHE, key=lambda key: CACHE[key][0])]
                while CACHE and sum(entry[3] for entry in CACHE.values()) + snapshot_size > 64 * 1024 * 1024:
                    del CACHE[min(CACHE, key=lambda key: CACHE[key][0])]
                CACHE[report['snapshotId']] = (now + 900, owner, report, snapshot_size)
            self.respond(200, dict(result=0, data=report))
        except ReportError as error:
            LOG.warning('Report refused: %s', error.message)
            self.respond(error.status, dict(result=35050, message=error.message))
        except (ValueError, KeyError, TypeError):
            self.respond(400, dict(result=35050, message='Invalid report parameters or inconsistent source data'))
        except Exception as error:
            LOG.warning('Report unavailable (%s)', type(error).__name__)
            self.respond(503, dict(result=35050, message='The complete report could not be generated'))


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    ThreadingHTTPServer((os.environ.get('QC_REPORT_BIND', '127.0.0.1'), int(os.environ.get('QC_REPORT_PORT', '18794'))), Handler).serve_forever()
