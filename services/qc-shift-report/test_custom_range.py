"""Custom local periods use the same read-only aggregation and snapshot contract."""
import io
import json
import threading
import unittest
import urllib.request
import urllib.error
from contextlib import contextmanager
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from openpyxl import load_workbook
from pypdf import PdfReader
import report_api
from report_core import aggregate, range_bounds, excel_bytes
from report_pdf import pdf_bytes
from test_report import record


class CustomPeriods(unittest.TestCase):
    def test_site_zones_and_overnight(self):
        for zone, hour in [('America/Chicago', '11'), ('America/Los_Angeles', '13')]:
            with self.subTest(zone=zone):
                start, end = range_bounds('2026-10-23T06:30', '2026-10-24T06:30', zone)
                self.assertEqual(start.isoformat(), f'2026-10-23T{hour}:30:00+00:00')
                self.assertEqual((end-start).total_seconds(), 86400)

    def test_dst_spanning_periods(self):
        for zone in ['America/Chicago', 'America/Los_Angeles']:
            for start, end, hours in [('2026-10-31T18:30', '2026-11-01T06:30', 13),
                                      ('2026-03-07T18:30', '2026-03-08T06:30', 11)]:
                with self.subTest(zone=zone, start=start):
                    first, last = range_bounds(start, end, zone)
                    self.assertEqual((last-first).total_seconds()/3600, hours)

    def test_invalid_ambiguous_and_missing_boundaries(self):
        for start, end in [('2026-10-23T06:30Z','2026-10-23T07:30'),
                           ('2026-02-30T06:30','2026-03-01T06:30'),
                           ('2026-10-23T06:30','2026-10-23T06:30'),
                           ('2026-10-24T06:30','2026-10-23T06:30'),
                           ('2026-10-01T00:00','2026-11-02T00:00'),
                           ('2026-11-01T01:30','2026-11-01T06:30'),
                           ('2026-03-08T02:30','2026-03-08T06:30'),
                           (None, '2026-10-23T06:30')]:
            with self.subTest(start=start), self.assertRaises(ValueError):
                range_bounds(start,end,'America/Chicago')

    def make_report(self):
        bounds = range_bounds('2026-10-23T06:30:00', '2026-10-25T18:45:12', 'America/Chicago')
        samples = [record('start', timestamp=bounds[0]), record('end', timestamp=bounds[1])]
        return aggregate(1, '2026-10-23', None, 'America/Chicago', samples, [], [], [], bounds=bounds)

    def test_custom_aggregation_and_exports_keep_exact_period(self):
        result = self.make_report()
        self.assertEqual(result['totals']['firstSample'],1)
        self.assertEqual(result['shift'],'custom')
        self.assertIsNone(result['schedule'])
        sheet = load_workbook(io.BytesIO(excel_bytes(result))).active
        self.assertIn('2026-10-25 18:45:12', sheet['A2'].value)
        self.assertIn('America/Chicago', sheet['A2'].value)
        text = '\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(pdf_bytes(result))).pages)
        self.assertIn('2026-10-25 18:45:12', text)
        self.assertIn('Custom date/time range', text)

    def test_query_scopes_utc_bounds_without_needing_shift_configuration(self):
        calls=[]
        class Cursor:
            def execute(self, sql, parameters): calls.append((sql,parameters))
            def fetchall(self):
                return [dict(company_id=1,time_zone='America/Chicago')] if len(calls)==1 else []
        @contextmanager
        def db(): yield Cursor()
        with patch('report_api.database',db):
            result = report_api.query_report(1,1,start_local='2026-10-23T06:30',end_local='2026-10-24T06:30')
        self.assertEqual(result['startTime'],'2026-10-23T11:30:00+00:00')
        self.assertTrue(all(sql.strip().startswith('SELECT') for sql,_ in calls))
        self.assertFalse(any('production_shift_schedule' in sql for sql,_ in calls))
        for _, params in calls[1:]:
            if isinstance(params,dict) and 'start' in params:
                self.assertEqual(params['warehouse'],1)
                self.assertEqual(params['start'].isoformat(),'2026-10-23T11:30:00')
                self.assertEqual(params['end'].isoformat(),'2026-10-24T11:30:00')

    def test_http_custom_query_and_reject_mixed_or_duplicate_parameters(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),report_api.Handler)
        worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start()
        prefix=f'http://127.0.0.1:{server.server_port}/qc-shift-report/report?'
        valid='companyId=1&warehouseId=1&startLocal=2026-10-23T06:30&endLocal=2026-10-24T06:30'
        try:
            with patch('report_api.authorize',return_value=('fixture',1,1)), patch('report_api.query_report',return_value=self.make_report()) as query:
                with urllib.request.urlopen(prefix+valid) as response:
                    self.assertEqual(json.load(response)['data']['shift'],'custom')
                query.assert_called_once_with(1,1,start_local='2026-10-23T06:30',end_local='2026-10-24T06:30')
                query.reset_mock()
                with urllib.request.urlopen(prefix+valid+'&itemFamilyIds=10%2C20') as response:
                    self.assertEqual(response.status,200)
                query.assert_called_once_with(1,1,start_local='2026-10-23T06:30',end_local='2026-10-24T06:30',item_family_ids='10,20')
                for suffix in ['&itemFamilyIds=10&itemFamilyIds=20','&date=2026-10-23&shift=1','&startLocal=2026-10-22T06:30','&timezone=UTC']:
                    with self.subTest(suffix=suffix), self.assertRaises(urllib.error.HTTPError) as error:
                        urllib.request.urlopen(prefix+valid+suffix)
                    self.assertEqual(error.exception.code,400)
        finally:
            server.shutdown();server.server_close();worker.join()
