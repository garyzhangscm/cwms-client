import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

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
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/subscription' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'configuration', component: AlertConfigurationComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/configuration' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'alert', component: AlertAlertComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/alert' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'subscription-maintenance', component: AlertSubscriptionMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/subscription' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'web-message-alert', component: AlertWebMessageAlertComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/web-message-alert' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'web-message-alert-detail', component: AlertWebMessageAlertDetailComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/web-message-alert' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'template', component: AlertAlertTemplateComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/template' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'template/maintenance', component: AlertAlertTemplateMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/alert/template' ], 
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
