import sys, importlib, json
from pathlib import Path
sys.path.insert(0, '/tmp/colton-outbound-release')
f=importlib.import_module('preview-server'); f.WEB=Path('/tmp/colton-load-planning/browser')
orders=[dict(id=i,number=f'TEST-PENDING-{i:02}',status='INPROCESS') for i in range(1,24)]
orders += [dict(id=101,number='TEST-OPEN',status='OPEN')]
plans=[]
class Preview(f.Preview):
 def do_GET(self):
  path=f.urlsplit(self.path).path;q=f.parse_qs(f.urlsplit(self.path).query);data=None
  if path.endswith('/trailer-appointments'): data=[dict(id=1,number='TEST-LOAD',status='PLANNED',type='SHIPPING'),dict(id=2,number='OTHER-LOAD',status='PLANNED',type='SHIPPING')]
  elif path.endswith('/shipping/shipment-options'): data=dict(shipments=[],selectedIds=[],orderPlanning=True)
  elif path.endswith('/shipping/order-plans'): data=dict(orders=plans if '/loads/1/' in path else [dict(orderId=2,orderNumber='TEST-PENDING-02',shipmentId=202)])
  elif path.endswith('/orders/page'):
   matching=[o for o in orders if o['status']==q.get('status',[''])[0] and q.get('number',[''])[0] in o['number']]
   page=int(q.get('page',['1'])[0]);size=int(q.get('size',['20'])[0]);data=dict(items=matching[(page-1)*size:page*size],page=page,size=size,total=len(matching))
  elif path.endswith('/outbound/stops'): data=[dict(trailerAppointmentId=2,shipments=[dict(id=203,orderNumbers=['TEST-PENDING-03'])])]
  elif path.endswith('/loads/pallet-counts'): data={}
  elif path.endswith('/loads/1/shipping'): data=dict(loadId=1,loadNumber='TEST-LOAD',lines=[],pendingOrders=plans,canConfirm=False)
  if data is not None:return self.response(dict(result=0,data=data))
  return super().do_GET()
 def do_POST(self):
  path=f.urlsplit(self.path).path
  if path=='/api/outbound/loads/1/shipping/order-plans':
   body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
   order=next(o for o in orders if o['number']==body['orderNumber'])
   assert order['status'] in ('OPEN','INPROCESS') and order['id']!=2
   plans.append(dict(orderId=order['id'],orderNumber=order['number'],shipmentId=200+order['id']))
   return self.response(dict(result=0,data=dict(orders=plans)))
  return super().do_POST()
f.ThreadingHTTPServer(('127.0.0.1',4305),Preview).serve_forever()
