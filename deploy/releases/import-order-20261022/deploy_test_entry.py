"""Run as the test Web user; preserve Angular/Line Clearance preview on 4201."""
import datetime,json,pathlib,subprocess,time,urllib.request,os
P=pathlib.Path
web_home=P.home();units=web_home/'.config/systemd/user';source=units/'mes-web-dev.service';original=source.read_text()
if '--port 4200' not in original:raise RuntimeError('Expected original Angular test service; refuse overwrite')
target=os.environ['MES_TEST_IMAGE_UPSTREAM'];public_base=os.environ['MES_TEST_PUBLIC_BASE'];preview_base=os.environ['MES_PREVIEW_PUBLIC_BASE']
if any(any(c in value for c in ('\n','\r',' ','"',"'",'\\','%')) for value in [target,public_base,preview_base]):raise RuntimeError('Invalid configured test URL')
backup=web_home/'mes-web/release-backups'/datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ');backup.mkdir(parents=True,mode=0o700)
(backup/'mes-web-dev.service').write_text(original)
def ready(url,tries=80):
 for _ in range(tries):
  try:
   with urllib.request.urlopen(url,timeout=5) as r:
    if r.status==200 and r.read(256):return
  except Exception:pass
  time.sleep(2)
 raise RuntimeError('Endpoint not ready: '+url)
def run(*args):subprocess.check_call(['systemctl','--user',*args])
ready(target+'/healthz',3)
preview=units/'mes-web-preview.service'
if preview.exists():raise RuntimeError('Preview unit already exists; inspect first')
preview.write_text(original.replace('--port 4200','--port 4201').replace('Colton MES frontend development server','MES preserved Angular / Line Clearance preview'))
run('daemon-reload');run('start','mes-web-preview.service')
try:
 ready('http://127.0.0.1:4201/')
 proxy=web_home/'mes-web/import-orders-release-20261022/test_image_proxy.cjs'
 if not proxy.exists():raise RuntimeError('Proxy source missing')
 new='''[Unit]
Description=MES test URL serving pinned release images
After=network.target
[Service]
Type=simple
ExecStart=%h/.local/opt/node-v22.23.3-linux-x64/bin/node %h/mes-web/import-orders-release-20261022/test_image_proxy.cjs '''+target+'''
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
Environment="MES_TEST_IMAGE_UPSTREAM='''+target+'''"
Environment="MES_HTTP_PROXY_MODULE=%h/mes-web/cwms-client/node_modules/http-proxy"
[Install]
WantedBy=default.target
'''
 run('stop','mes-web-dev.service');source.write_text(new);run('daemon-reload');run('start','mes-web-dev.service')
 ready('http://127.0.0.1:4200/healthz',10);ready('http://127.0.0.1:4200/',3)
 run('enable','mes-web-preview.service');run('enable','mes-web-dev.service')
 result={'testUrl':public_base,'imageUpstream':target,'preservedPreview':preview_base,'backup':str(backup),'lineClearanceApiPreserved':True,'businessWritesForVerification':False}
 (backup/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
except BaseException:
 run('stop','mes-web-dev.service');source.write_text(original);run('daemon-reload');run('start','mes-web-dev.service');run('stop','mes-web-preview.service');raise
