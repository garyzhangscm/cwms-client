import io
import json
import unittest
from contextlib import contextmanager
from datetime import datetime
from unittest.mock import patch
from openpyxl import load_workbook
from report_api import query_report, parse_family_ids, ReportError
from report_core import excel_bytes


class FamilyFilters(unittest.TestCase):
    def query(self, selected=None, allowed=(10,20,30), custom=False):
        def record(family, identity):
            return dict(id=identity,number=identity,username=None,workOrderNumber='fixture-order',warehouseId=1,
                        timestamp=datetime(2026,10,23,12),product='P'+str(family),machine='M'+str(family),
                        itemFamilyId=family,status='PASS',lpn='L'+str(family))
        class Cursor:
            sql=''
            def execute(self, sql, params): self.sql=sql
            def fetchall(self):
                s=self.sql
                if 'SELECT w.company_id' in s:return [dict(company_id=1,time_zone='UTC')]
                if 'production_shift_schedule_id id' in s:return [dict(id=1,start='06:30:00',end='18:30:00',nextDay=False)]
                if 'FROM item_family' in s:return [dict(id=f,name='Family '+str(f)) for f in allowed if f in parse_family_ids(selected)]
                if "CONCAT('sample:'" in s:return [record(f,'sample:'+str(f)) for f in (10,20,30)]
                if "CONCAT('request:'" in s:return [record(f,'request:'+str(f)) for f in (10,30)]
                if "CONCAT('legacy:'" in s:return [record(20,'legacy:20')]
                if 'SELECT DISTINCT q.qc_inspection_request_id' in s:
                    return [dict(record(f,'finished:'+str(f)),qcRequestId=f,inventoryId=f,workOrderId=f,itemFamilyId=999) for f in (10,20,30)]
                if 'producedTime' in s:return [dict(record(f,'mapping:'+str(f)),workOrderId=f,producedTime=datetime(2026,10,23,11)) for f in (10,20,30)]
                if 'FROM work_order_produce_transaction' in s:return [record(f,'produced:'+str(f)) for f in (10,20,30)]
                return []
        @contextmanager
        def db():yield Cursor()
        with patch('report_api.database',db),patch.dict('os.environ',{'QC_LEGACY_TIMEZONE':'UTC'}):
            if custom:return query_report(1,1,start_local='2026-10-23T06:30',end_local='2026-10-23T18:30',item_family_ids=selected)
            return query_report(1,1,'2026-10-23','1',item_family_ids=selected)

    def test_multiple_families_reconcile_all_counts_and_original_production_mapping(self):
        value=self.query('20,10,20')
        self.assertEqual(value['itemFamilyIds'],[10,20])
        self.assertEqual(value['itemFamilyNames'],['Family 10','Family 20'])
        self.assertEqual([r['product'] for r in value['rows']],['P10','P20'])
        self.assertEqual(value['totals']['firstSample'],2)
        self.assertEqual(value['totals']['inline'],2)
        self.assertEqual(value['totals']['finishedGoods'],2)
        self.assertEqual(value['totals']['producedPallets'],2)
        self.assertEqual(value['totals']['inspectionRate'],1)
        self.assertEqual(sum(len(r['inlineDetails']) for r in value['rows']),2)
        self.assertIn('Family 10, Family 20',load_workbook(io.BytesIO(excel_bytes(value))).active['A4'].value)

    def test_no_selection_preserves_all_families(self):
        value=self.query()
        self.assertEqual(value['itemFamilyIds'],[])
        self.assertEqual(len(value['rows']),3)
        self.assertEqual(value['totals']['producedPallets'],3)

    def test_one_family_custom_period(self):
        value=self.query('20',custom=True)
        self.assertEqual(value['shift'],'custom')
        self.assertEqual(len(value['rows']),1)
        self.assertEqual(value['totals']['inline'],1)

    def test_other_company_or_warehouse_family_is_rejected(self):
        with self.assertRaises(ReportError) as error:self.query('10,20',allowed=(10,))
        self.assertEqual(error.exception.status,403)

    def test_invalid_ids_never_reach_database(self):
        for value in ['', '0','-1','1.5','10 OR 1=1','10,','1,'*100+'2',10]:
            with self.subTest(value=value),self.assertRaises(ReportError):parse_family_ids(value)
        self.assertEqual(parse_family_ids('20,10,20'),(10,20))
