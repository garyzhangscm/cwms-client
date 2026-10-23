"""Narrow, backed-up image deployment; execute on the authorized site's master."""
import argparse,datetime,hashlib,json,pathlib,subprocess,time,yaml
P=pathlib.Path
WEB='brianwang1912/mes-web:v19.2-import-orders-20261022-02@sha256:d4c92a82f0d79da059982325fb625f2649275bfbf0e891de375e34f627406ae3'
REPORT='brianwang1912/mes-qc-shift-report:v20261022-receiving-history@sha256:3abc0f80c118653255c18be0330f10bc7ae60e165a9a5fedf987387d6e86b4cf'
HISTORY_HASH='e21b359e731503fa2b1612d914e0c0a42a50e16faf13525955e0a48c72870de0'
K=['kubectl','-n','staging']
def run(args):return subprocess.check_output(args,universal_newlines=True,stderr=subprocess.STDOUT)
def get(kind,name):return json.loads(run(K+['get',kind,name,'-o','json']))
def target_pod(name,image):
    pods=json.loads(run(K+['get','pods','-l','app='+name,'-o','json']))['items']
    ready=[p for p in pods if not p['metadata'].get('deletionTimestamp') and p['spec']['containers'][0]['image']==image and p.get('status',{}).get('containerStatuses',[{}])[0].get('ready')]
    if len(ready)!=1:raise RuntimeError('Expected one exact-image ready pod')
    return ready[0]['metadata']['name']
def persist(path,name,image):
    text=path.read_text();parts=text.split('\n---');found=0
    for i,part in enumerate(parts):
        d=yaml.safe_load(part)
        if not d or d.get('kind')!='Deployment' or d.get('metadata',{}).get('name')!=name:continue
        found+=1
        values=[c['image'] for c in d['spec']['template']['spec']['containers'] if c['name']==name]
        if name=='qc-shift-report':values += [c['image'] for c in d['spec']['template']['spec'].get('initContainers',[]) if 'mes-qc-shift-report' in c['image']]
        for old in set(values):part=part.replace(old,image)
        parts[i]=part
    if found!=1:raise RuntimeError('Persistent Deployment not uniquely identified')
    result='\n---'.join(parts);list(yaml.safe_load_all(result));path.write_text(result)
def main():
    p=argparse.ArgumentParser();p.add_argument('--site',choices=['colton','fay'],required=True);p.add_argument('--component',choices=['report','web'],required=True);args=p.parse_args()
    name='qc-shift-report' if args.component=='report' else 'webclient';image=REPORT if args.component=='report' else WEB
    before=get('deployment',name);old=before['spec']['template']['spec'];oldimage=old['containers'][0]['image']
    if oldimage==image:print(json.dumps({'site':args.site,'component':name,'alreadyCurrent':True,'image':image}));return
    backup=P('/root/k8s/backups')/('import-orders-'+args.component+'-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));backup.mkdir(mode=0o700)
    (backup/'deployment-before.json').write_text(json.dumps(before,indent=2));file=P('/root/k8s/6-qc-shift-report.yaml' if args.component=='report' else '/root/k8s/4-frontend-app.yaml');original=file.read_bytes();(backup/file.name).write_bytes(original)
    patches=[{'op':'test','path':'/metadata/resourceVersion','value':before['metadata']['resourceVersion']},{'op':'replace','path':'/spec/template/spec/containers/0/image','value':image}]
    if args.component=='report':
        for i,c in enumerate(old.get('initContainers',[])):
            if 'mes-qc-shift-report' in c['image']:patches.append({'op':'replace','path':'/spec/template/spec/initContainers/'+str(i)+'/image','value':image})
    else:
        if args.site=='fay':
            config_name='mes-web-imports-fay-20261022-02';mount=next(v for v in old['volumes'] if v['name']=='fay-web-nginx');previous=mount['configMap']['name'];config=get('configmap',previous);text=config['data']['default.conf.template']
            if 'redacted-site-prefix.' in text:raise RuntimeError('Cross-factory target in Fay configuration')
            marker='    location ^~ /api/ {' if '    location ^~ /api/ {' in text else '    location /api/ {'
            if marker not in text:raise RuntimeError('Expected Fay gateway route missing')
            imports='''    location ^~ /api/item-import/ {
        proxy_pass http://server.example.invalid:18793/item-import/;
        proxy_set_header Host $proxy_host;
        proxy_read_timeout 120s;
    }
    location ^~ /api/work-order-import/ {
        proxy_pass http://server.example.invalid:18792/work-order-import/;
        proxy_set_header Host $proxy_host;
        proxy_read_timeout 120s;
    }
    location ~* \\.mjs$ {
        types { application/javascript mjs; }
        try_files $uri =404;
        add_header Cache-Control 'no-cache';
    }
    location ~* \\.(?:js|css|json|map)$ {
        try_files $uri =404;
    }
'''
            text=text.replace("add_header Cache-Control 'no-cache';","add_header Cache-Control 'no-store' always;",1)
            text=text if 'location ^~ /api/item-import/' in text else text.replace(marker,imports+marker,1)
            # API JSON/download paths must take precedence over static-file regexes.
            text=text.replace('location /api/ {','location ^~ /api/ {')
            config={'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':config_name,'namespace':'staging'},'data':{'default.conf.template':text}}
            (backup/'nginx-before.json').write_text(json.dumps(get('configmap',previous),indent=2))
            subprocess.run(K+['apply','-f','-'],input=json.dumps(config),universal_newlines=True,check=True)
            index=next(i for i,v in enumerate(old['volumes']) if v['name']=='fay-web-nginx');patches.append({'op':'replace','path':'/spec/template/spec/volumes/'+str(index)+'/configMap/name','value':config_name})
    applied=False
    try:
        print(run(K+['patch','deployment',name,'--type=json','-p',json.dumps(patches)]),flush=True);applied=True
        print(run(K+['rollout','status','deployment/'+name,'--timeout=180s']),flush=True);pod=target_pod(name,image)
        if args.component=='report':
            check="import urllib.request,hashlib;assert hashlib.sha256(open('/app/report_history.py','rb').read()).hexdigest()=='"+HISTORY_HASH+"';r=urllib.request.urlopen('http://127.0.0.1:18794/qc-shift-report/health',timeout=5);assert r.status==200;print('exact source hash and report health passed')"
            print(run(K+['exec',pod,'--','python','-c',check]),flush=True)
        else:
            print(run(K+['exec',pod,'--','nginx','-t']),flush=True)
            print(run(K+['exec',pod,'--','sh','-ec','wget -qO- http://127.0.0.1/healthz; wget -qO /tmp/release-index.html http://127.0.0.1/; test -s /tmp/release-index.html']),flush=True)
        persist(file,name,image)
        if args.component=='web' and args.site=='fay':file.write_text(file.read_text().replace(previous,config_name))
        result={'site':args.site,'component':name,'image':image,'previousImage':oldimage,'pod':pod,'backup':str(backup),'persistentManifestUpdated':True,'businessWritesForVerification':False}
        (backup/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
    except BaseException:
        if applied:
            current=get('deployment',name)
            if current['spec']['template']['spec']['containers'][0]['image']==image:
                rollback={'spec':{'template':{'spec':{'containers':[{'name':old['containers'][0]['name'],'image':oldimage}]}}}}
                if 'initContainers' in old:rollback['spec']['template']['spec']['initContainers']=old['initContainers']
                if args.component=='web' and args.site=='fay':rollback['spec']['template']['spec']['volumes']=old['volumes']
                subprocess.call(K+['patch','deployment',name,'--type=strategic','-p',json.dumps(rollback)])
                subprocess.call(K+['rollout','status','deployment/'+name,'--timeout=180s']);file.write_bytes(original)
        raise
if __name__=='__main__':main()
