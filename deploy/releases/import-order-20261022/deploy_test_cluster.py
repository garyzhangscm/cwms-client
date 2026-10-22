"""Create isolated test workloads from the exact production images on Colton."""
import copy,json,pathlib,subprocess,datetime
P=pathlib.Path
K=['kubectl','-n','staging']
def run(a):return subprocess.check_output(a,universal_newlines=True)
def get(kind,name):return json.loads(run(K+['get',kind,name,'-o','json']))
def apply(obj):subprocess.run(K+['apply','-f','-'],input=json.dumps(obj),universal_newlines=True,check=True)
def main():
    backup=P('/root/k8s/backups')/('import-orders-test-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));backup.mkdir(mode=0o700)
    docs=[]
    for original in ['qc-shift-report','webclient']:
        source=get('deployment',original);name=original+'-release-test';spec=copy.deepcopy(source['spec']);spec['replicas']=1;spec['selector']={'matchLabels':{'app':name}};spec['template']['metadata']={'labels':{'app':name}}
        pod=spec['template']['spec'];pod.pop('nodeName',None)
        if original=='webclient':
            template=P('/tmp/import-orders-test-nginx.template').read_text().replace('http://qc-shift-report:18794/','http://qc-shift-report-release-test:18794/')
            if 'qc-shift-report-release-test' not in template:raise RuntimeError('Test report route missing')
            cm={'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':'mes-web-release-test-20261022','namespace':'staging'},'data':{'default.conf.template':template}}
            docs.append(cm);apply(cm)
            pod.setdefault('volumes',[]).append({'name':'release-test-nginx','configMap':{'name':cm['metadata']['name']}})
            pod['containers'][0].setdefault('volumeMounts',[]).append({'name':'release-test-nginx','mountPath':'/etc/nginx/templates/default.conf.template','subPath':'default.conf.template','readOnly':True})
        d={'apiVersion':'apps/v1','kind':'Deployment','metadata':{'name':name,'namespace':'staging'},'spec':spec};docs.append(d);apply(d)
        port=80 if original=='webclient' else 18794
        service={'apiVersion':'v1','kind':'Service','metadata':{'name':name,'namespace':'staging'},'spec':{'type':'NodePort' if original=='webclient' else 'ClusterIP','selector':{'app':name},'ports':[{'port':port,'targetPort':port}]}}
        docs.append(service);apply(service)
        print(run(K+['rollout','status','deployment/'+name,'--timeout=180s']),flush=True)
        actual=get('deployment',name)
        if actual['spec']['template']['spec']['containers'][0]['image']!=source['spec']['template']['spec']['containers'][0]['image']:raise RuntimeError('Test image mismatch')
    file=P('/root/k8s/7-import-orders-release-test.json');file.write_text(json.dumps({'apiVersion':'v1','kind':'List','items':docs},indent=2));file.chmod(0o600)
    port=get('service','webclient-release-test')['spec']['ports'][0]['nodePort']
    result={'testUpstream':'http://server.example.invalid:'+str(port),'sameProductionImages':True,'separateWorkloads':True,'businessWritesForVerification':False,'persistentManifest':str(file)}
    (backup/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
if __name__=='__main__':main()
