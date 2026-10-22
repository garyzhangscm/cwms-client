import copy
import unittest
from datetime import datetime,timedelta
from report_history import classify,resolve_historical_receipts

class ReceiptHistoryTests(unittest.TestCase):
 def setUp(self):
  self.origin=datetime(2026,10,19,17,44);self.qc=self.origin+timedelta(minutes=4)
  self.rows=[dict(warehouseId=1,qcRequestId=1001,inventoryId=101,workOrderId=None,lpn=None,timestamp=self.qc)]
  self.sources=[dict(warehouseId=1,originRequestId=901,inventoryId=101,originTime=self.origin,
                     originType='INBOUND_BY_INVENTORY',workOrderId=None,sampleId=None)]
 def result(self):return classify(self.rows,self.sources)
 def test_exact_inventory_origin_has_auditable_evidence(self):
  before=copy.deepcopy(self.rows)
  self.assertEqual(self.result()[(1001,101)],dict(qcRequestId=1001,inventoryId=101,sourceQcRequestId=901,sourceType='INBOUND_BY_INVENTORY'))
  self.assertEqual(self.rows,before)
 def test_different_inventory_at_same_time_is_not_matched(self):
  self.sources[0]['inventoryId']=102;self.assertEqual(self.result(),{})
 def test_same_inventory_in_other_warehouse_is_not_matched(self):
  self.sources[0]['warehouseId']=2;self.assertEqual(self.result(),{})
 def test_generic_qc_type_is_not_proof_of_receiving(self):
  self.sources[0]['originType']='BY_INVENTORY';self.assertEqual(self.result(),{})
 def test_missing_source_is_not_silently_excluded(self):
  self.sources=[];self.assertEqual(self.result(),{})
 def test_null_source_type_is_not_proof_of_receiving(self):
  self.sources[0]['originType']=None;self.assertEqual(self.result(),{})
 def test_future_source_cannot_explain_old_inspection(self):
  self.sources[0]['originTime']=self.qc+timedelta(hours=1);self.assertEqual(self.result(),{})
 def test_current_work_order_is_not_overridden(self):
  self.rows[0]['workOrderId']=201;self.assertEqual(self.result(),{})
 def test_existing_lpn_is_not_overridden(self):
  self.rows[0]['lpn']='PRODUCTION-LPN';self.assertEqual(self.result(),{})
 def test_conflicting_historical_work_order_is_not_excluded(self):
  self.sources.append(dict(self.sources[0],originRequestId=902,workOrderId=201));self.assertEqual(self.result(),{})
 def test_conflicting_historical_sampling_is_not_excluded(self):
  self.sources.append(dict(self.sources[0],originRequestId=902,sampleId=301));self.assertEqual(self.result(),{})
 def test_conflicting_sampling_type_is_not_excluded(self):
  self.sources.append(dict(self.sources[0],originRequestId=902,originType='BY_WORK_ORDER_SAMPLING'));self.assertEqual(self.result(),{})
 def test_duplicate_receiving_evidence_is_consistent(self):
  self.sources.append(dict(self.sources[0],originRequestId=902));self.assertEqual(len(self.result()),1)
 def test_reinspection_does_not_change_origin(self):
  self.rows.append(dict(self.rows[0],qcRequestId=1002,timestamp=self.qc+timedelta(hours=1)))
  self.assertEqual(set(self.result()),{(1001,101),(1002,101)})
 def test_missing_inventory_identity_is_not_guessed(self):
  self.rows[0]['inventoryId']=None;self.assertEqual(self.result(),{})
 def test_own_record_is_not_historical_proof(self):
  self.sources[0]['originRequestId']=1001;self.assertEqual(self.result(),{})
 def test_known_production_does_not_query_history(self):
  class NoQueries:
   def execute(self,*args):raise AssertionError('Unexpected history query')
  self.assertEqual(resolve_historical_receipts(NoQueries(),1,[dict(lpn='P1',workOrderId=10)]),{})
 def test_history_lookup_is_warehouse_scoped_and_bounded(self):
  class Cursor:
   def execute(inner,sql,args):
    self.assertIn('q.warehouse_id=%s',sql);self.assertIn('q.created_time <= %s',sql)
    self.assertIn('LIMIT 25001',sql);self.assertEqual(args,(1,(101,),self.qc))
   def fetchall(inner):return self.sources
  self.assertEqual(len(resolve_historical_receipts(Cursor(),1,self.rows)),1)
 def test_cross_warehouse_input_is_rejected(self):
  self.rows[0]['warehouseId']=2
  with self.assertRaises(ValueError):resolve_historical_receipts(None,1,self.rows)
if __name__=='__main__':unittest.main()
