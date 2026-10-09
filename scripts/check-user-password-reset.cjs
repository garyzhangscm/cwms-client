const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, Subject, firstValueFrom, map } = require('rxjs');
function load(path, name, members, bindings) {
  const source=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
  const cls=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text===name);
  const methods=cls.members.filter(n=>n.name&&members.includes(n.name.getText(source))).map(n=>n.getText(source));
  const js=ts.transpile(`class Tested { ${methods.join('\n')} }`,{target:ts.ScriptTarget.ES2022});
  return new Function(...Object.keys(bindings),js+'; return Tested;')(...Object.values(bindings));
}
(async()=>{
 const environment={production:false};
 const Service=load('src/app/routes/auth/services/user.service.ts','UserService',['resetPassword'],{environment,map});
 const service=new Service();let captured;
 service.companyService={getCurrentCompany:()=>({id:1})};
 service.http={post:(url,body)=>{captured={url,body};return of({data:{}});}};
 service.resetPassword(10,'test&only+password?',true).subscribe();
 assert.equal(captured.url,'user-password-reset-test/users/10/password-reset?companyId=1');
 assert.equal(captured.body.newPassword,'test&only+password?');
 assert.ok(!captured.url.includes('test&only'));assert.equal(captured.body.changePasswordAtNextLogon,true);
 const Component=load('src/app/routes/auth/user/user.component.ts','AuthUserComponent',['hasPasswordResetAccess','canResetPassword','openResetPasswordModal','clearResetPassword'],{firstValueFrom});
 const c=new Component();let modal;let submissions=0;let successes=0;
 c.i18n={fanyi:key=>key};c.messageService={warning:()=>{},success:()=>successes++};
 c.modalService={create:config=>{modal=config;}};
 const target={id:10,companyId:1,username:'target'};
 assert.equal(c.hasPasswordResetAccess({admin:false,companyId:1,roles:[{name:'Admin',enabled:true,companyId:1}]}),true);
 for(const role of [{name:'Admin',enabled:false,companyId:1},{name:'Admin',enabled:true,companyId:2},{name:'WarehouseManager',enabled:true,companyId:1}])
  assert.equal(c.hasPasswordResetAccess({admin:false,companyId:1,roles:[role]}),false);
 assert.equal(c.hasPasswordResetAccess({admin:false,companyId:1}),false);
 c.isLoginUserAdmin=false;c.openResetPasswordModal(target,{});assert.equal(modal,undefined);
 c.isLoginUserAdmin=true;assert.equal(c.canResetPassword({...target,systemAdmin:true}),false);
 c.displayOnly=true;assert.equal(c.canResetPassword(target),false);c.displayOnly=false;
 const result=new Subject();c.userService={resetPassword:()=>{submissions++;return result;}};
 c.openResetPasswordModal(target,{});assert.equal(c.forcePasswordChange,true);
 assert.equal(c.resetPasswordUser.username,'target');
 const initialModal=modal;c.openResetPasswordModal({id:11,companyId:1,username:'other'},{});
 assert.equal(modal,initialModal);assert.equal(c.resetPasswordUser.id,10);
 c.resetPasswordValue='valid-test-password';c.resetPasswordConfirmation='different';
 assert.equal(await modal.nzOnOk(),false);assert.equal(submissions,0);
 c.resetPasswordConfirmation=c.resetPasswordValue;const submitting=modal.nzOnOk();
 assert.equal(submissions,1);assert.equal(await modal.nzOnOk(),false);
 result.next(undefined);result.complete();assert.equal(await submitting,true);
 assert.equal(successes,1);assert.equal(c.resetPasswordValue,'');assert.equal(c.resetPasswordConfirmation,'');
 c.openResetPasswordModal(target,{});c.resetPasswordValue='unsaved-test-password';modal.nzOnCancel();
 assert.equal(c.resetPasswordValue,'');assert.equal(submissions,1);
 console.log('PASS: admin visibility, read-only/system account guards, matching passwords, no duplicate submit, request-body password and cleanup. APIs mocked.');
})().catch(error=>{console.error(error);process.exit(1);});
