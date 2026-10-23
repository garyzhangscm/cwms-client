"""Read-only HTTP smoke checks; no credentials or business mutations."""
import argparse,json,urllib.request,urllib.error
p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--site',choices=['colton','fay','test'],required=True);args=p.parse_args()
checks=[]
def req(path,expected):
 try:r=urllib.request.urlopen(args.base+path,timeout=15)
 except urllib.error.HTTPError as e:r=e
 body=r.read();assert r.code==expected,(path,r.code,expected)
 checks.append({'path':path,'status':r.code})
 return r,body
r,b=req('/healthz',200);assert b.strip()==b'ok'
r,b=req('/',200);assert b'main-RWP5ZHWM.js' in b
r,b=req('/index.html',200);assert 'no-store' in r.headers.get('Cache-Control','')
for language in ('en-US','zh-CN'):
 r,b=req('/api/resource/assets/i18n/'+language+'.json',200);assert isinstance(json.loads(b),dict)
r,b=req('/assets/pdf-import/pdf/pdf.worker.min.mjs',200);assert 'javascript' in r.headers.get('Content-Type','')
req('/missing-RELEASECHECK.js',404)
req('/api/item-import/batches',403)
r,b=req('/api/work-order-import/batches',503 if args.site=='fay' else 403)
if args.site=='fay':assert 'Work Order file import is not configured' in json.loads(b)['message']
if args.site=='fay':
 for prefix in ('inventory-handoff','integration-settings'):
  r,b=req('/api/'+prefix+'/__audit__.json',503);assert 'not deployed' in json.loads(b)['error']
req('/api/qc-shift-report/health',200)
print(json.dumps({'site':args.site,'base':args.base,'checks':checks,'businessWrites':False}))
