"""Keep FAY's report on its working application node; avoid broken cross-node routing."""
import datetime,json,pathlib,subprocess,yaml
P=pathlib.Path;K=['kubectl','-n','staging']
def run(a):return subprocess.check_output(a,universal_newlines=True,stderr=subprocess.STDOUT)
d=json.loads(run(K+['get','deployment','qc-shift-report','-o','json']));pods=json.loads(run(K+['get','pods','-l','app=webclient','-o','json']))['items'];ready=[p for p in pods if not p['metadata'].get('deletionTimestamp') and p.get('status',{}).get('containerStatuses',[{}])[0].get('ready')]
if len(ready)!=1:raise RuntimeError('Expected one ready Web pod')
node=ready[0]['spec']['nodeName']
if node!='k8s-app1-ar':raise RuntimeError('Unexpected FAY application node')
old=d['spec']['template']['spec'].get('nodeSelector');selector=dict(old or {},**{'kubernetes.io/hostname':node})
b=P('/root/k8s/backups')/('import-orders-fay-report-node-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));b.mkdir(mode=0o700);(b/'deployment-before.json').write_text(json.dumps(d));file=P('/root/k8s/6-qc-shift-report.yaml');original=file.read_text();(b/file.name).write_text(original)
try:
 print(run(K+['patch','deployment','qc-shift-report','--type=merge','-p',json.dumps({'spec':{'template':{'spec':{'nodeSelector':selector}}}})]),flush=True)
 print(run(K+['rollout','status','deployment/qc-shift-report','--timeout=180s']),flush=True)
 print(run(K+['exec',ready[0]['metadata']['name'],'--','sh','-ec','wget -T 10 -qO- http://qc-shift-report:18794/qc-shift-report/health']),flush=True)
 docs=list(yaml.safe_load_all(original));found=0
 for item in docs:
  if item and item.get('kind')=='Deployment' and item.get('metadata',{}).get('name')=='qc-shift-report':item['spec']['template']['spec']['nodeSelector']=selector;found+=1
 if found!=1:raise RuntimeError('Persistent report manifest not uniquely found')
 file.write_text(yaml.safe_dump_all(docs));print(json.dumps({'reportNode':node,'webToReportHealth':200,'backup':str(b),'persistentManifestUpdated':True}),flush=True)
except BaseException:
 subprocess.call(K+['patch','deployment','qc-shift-report','--type=merge','-p',json.dumps({'spec':{'template':{'spec':{'nodeSelector':old}}}})]);file.write_text(original);raise
