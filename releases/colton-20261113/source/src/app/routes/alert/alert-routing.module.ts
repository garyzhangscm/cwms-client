import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { aclCanActivate, ACLGuardType } from '@delon/acl';

import { AlertAlertTemplateMaintenanceComponent } from './alert-template-maintenance/alert-template-maintenance.component';
import { AlertAlertTemplateComponent } from './alert-template/alert-template.component';
import { AlertAlertComponent } from './alert/alert.component';
import { AlertConfigurationComponent } from './configuration/configuration.component';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance/subscription-maintenance.component';
import { AlertSubscriptionComponent } from './subscription/subscription.component';
import { AlertWebMessageAlertDetailComponent } from './web-message-alert-detail/web-message-alert-detail.component';
import { AlertWebMessageAlertComponent } from './web-message-alert/web-message-alert.component';

const routes: Routes = [

  { path: 'subscription', component: AlertSubscriptionComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/subscription' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'configuration', component: AlertConfigurationComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'alert', component: AlertAlertComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/alert' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'subscription-maintenance', component: AlertSubscriptionMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/subscription', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'web-message-alert', component: AlertWebMessageAlertComponent  , 
  /**
   * 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/web-message-alert' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
   * 
   */
  },
  { path: 'web-message-alert-detail', component: AlertWebMessageAlertDetailComponent , 
  /**
   * 
   * 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/web-message-alert', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
   */
  },
  { path: 'template', component: AlertAlertTemplateComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/template', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'template/maintenance', component: AlertAlertTemplateMaintenanceComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/alert/template' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertRoutingModule { }
