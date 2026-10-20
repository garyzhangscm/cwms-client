import unittest
from report_core import aggregate,attach_inspection_details
DAY=dict(id='1',start='06:00:00',end='18:00:00',nextDay=False)
def sample(id='sample:1',user='CWMS-USER',**kw):
 return dict(id=id,number='WQC1',warehouseId=1,timestamp='2026-10-19T07:00:00Z',product='P1',machine='M1',username=user,**kw)
def inline(id='request:1',user='LYDIA',**kw):
 return dict(id=id,number='QCR1',warehouseId=1,timestamp='2026-10-19T08:00:00Z',product='P1',machine='M1',username=user,status='FAIL',**kw)
def report(samples,checks):
 r=aggregate(1,'2026-10-19',DAY,'UTC',samples,checks,[],[])
 return attach_inspection_details(r,samples,checks,{'lydia':'Lydia Solis','blanca':'Blanca Rodriguez'})
class DetailsTests(unittest.TestCase):
 def test_registration_is_not_inferred_from_inspector(self):
  r=report([sample()],[inline()]);row=r['rows'][0]
  self.assertIsNone(row['firstSampleDetails'][0]['username']);self.assertIsNone(row['firstSampleDetails'][0]['displayName'])
  self.assertEqual(row['inlineDetails'][0]['displayName'],'Lydia Solis');self.assertEqual(row['inlineDetails'][0]['result'],'FAIL')
 def test_multiple_people_and_repeated_join_do_not_change_counts(self):
  a=inline();b=inline('request:2','Blanca');r=report([], [a,a,b]);row=r['rows'][0]
  self.assertEqual(row['inline'],2);self.assertEqual(len(row['inlineDetails']),2)
  self.assertEqual({x['displayName'] for x in row['inlineDetails']},{'Lydia Solis','Blanca Rodriguez'})
 def test_new_registration_has_its_own_person_and_unknown_real_username_is_preserved(self):
  row=report([sample(user='Blanca')],[inline(user='UNCATALOGUED')])['rows'][0]
  self.assertEqual(row['firstSampleDetails'][0]['displayName'],'Blanca Rodriguez');self.assertEqual(row['inlineDetails'][0]['displayName'],'UNCATALOGUED')
 def test_conflicting_same_record_identity_is_rejected(self):
  with self.assertRaises(ValueError):report([], [inline(),inline(user='Blanca')])
 def test_detail_scope_is_rechecked(self):
  r=aggregate(1,'2026-10-19',DAY,'UTC',[sample()],[],[],[])
  wrong=sample();wrong['warehouseId']=2
  with self.assertRaises(ValueError):attach_inspection_details(r,[wrong],[],{})
if __name__=='__main__':unittest.main()
