import unittest
from datetime import datetime
from contextlib import contextmanager, nullcontext
from unittest.mock import patch
from report_api import query_report,ReportError
class MappingTests(unittest.TestCase):
 def run_report(self,mappings,extra=(),receipt_evidence=None):
  class Cursor:
   sql=''
   def execute(self,sql,*args):self.sql=sql
   def fetchall(self):
    if 'SELECT w.company_id' in self.sql:return [{'company_id':1,'time_zone':'UTC'}]
    if 'production_shift_schedule_id id' in self.sql:return [{'id':1,'start':'06:00:00','end':'18:00:00','nextDay':False}]
    if 'SELECT DISTINCT q.qc_inspection_request_id' in self.sql:return [{'warehouseId':1,'timestamp':datetime(2026,10,19,12),'status':'PASS','lpn':'L1','workOrderId':10},{'warehouseId':1,'timestamp':datetime(2026,10,19,12,30),'status':'PASS','lpn':'L1','workOrderId':10}]+list(extra)
    if 'producedTime' in self.sql:return mappings
    return []
  @contextmanager
  def db():yield Cursor()
  with patch('report_api.database',db), (patch('report_api.resolve_historical_receipts',return_value=receipt_evidence) if receipt_evidence is not None else nullcontext()):return query_report(1,1,'2026-10-19','1')
 def mapping(self,wo=10,hour=11,product='P1',machine='M1'):
  return {'warehouseId':1,'workOrderId':wo,'lpn':'L1','producedTime':datetime(2026,10,19,hour),'product':product,'machine':machine}
 def test_reinspection_dedup_and_original_wo_and_qc_cutoff(self):
  r=self.run_report([self.mapping(),self.mapping(11,11,'WRONG-WO','M2'),self.mapping(10,13,'FUTURE','M3')])
  self.assertEqual(r['totals']['finishedGoods'],1);self.assertEqual(r['rows'][0]['product'],'P1');self.assertEqual(r['rows'][0]['machine'],'M1')
 def test_missing_mapping_rejects_partial_report(self):
  with self.assertRaises(ReportError):self.run_report([])
 def test_conflicting_original_machines_reject_partial_report(self):
  with self.assertRaises(ReportError):self.run_report([self.mapping(),self.mapping(machine='M2')])
 def missing_receipt(self,request=42,inventory=101,wo=None):
  return dict(warehouseId=1,qcRequestId=request,inventoryId=inventory,timestamp=datetime(2026,10,19,12),status='PASS',lpn=None,workOrderId=wo)
 def test_proven_receiving_is_excluded_but_production_count_is_preserved(self):
  r=self.run_report([self.mapping()],extra=[self.missing_receipt()],receipt_evidence={(42,101):{}})
  self.assertEqual(r['totals']['finishedGoods'],1);self.assertEqual(r['excludedReceivingInspections'],1)
  self.assertEqual(r['rows'][0]['product'],'P1');self.assertTrue(any('historical receiving' in w for w in r['warnings']))
 def test_another_unknown_is_not_hidden_by_a_proven_receipt(self):
  with self.assertRaises(ReportError):self.run_report([self.mapping()],extra=[self.missing_receipt(),self.missing_receipt(43,102)],receipt_evidence={(42,101):{}})
 def test_explicit_work_order_is_not_filtered_by_receipt_result(self):
  with self.assertRaises(ReportError):self.run_report([self.mapping()],extra=[self.missing_receipt(wo=10)],receipt_evidence={(42,101):{}})
if __name__=='__main__':unittest.main()
