import { Routes } from '@angular/router';
import { startPageGuard } from '@core';
import { authSimpleCanActivate, authSimpleCanActivateChild } from '@delon/auth';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutBasicComponent } from '../layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'warehouse-layout', loadChildren: () => import('./warehouse-layout/warehouse-layout.module').then((m) => m.WarehouseLayoutModule) },
      { path: 'util', loadChildren: () => import('./util/util.module').then((m) => m.UtilModule) },
      { path: 'auth', loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule) },
      { path: 'common', loadChildren: () => import('./common/common.module').then((m) => m.CommonModule) },
      { path: 'report', loadChildren: () => import('./report/report.module').then((m) => m.ReportModule) },
      { path: 'inbound', loadChildren: () => import('./inbound/inbound.module').then((m) => m.InboundModule) },
      { path: 'inventory', loadChildren: () => import('./inventory/inventory.module').then((m) => m.InventoryModule) },
      { path: 'outbound', loadChildren: () => import('./outbound/outbound.module').then((m) => m.OutboundModule) },
      { path: 'work-order', loadChildren: () => import('./work-order/work-order.module').then((m) => m.WorkOrderModule) },
      { path: 'integration', loadChildren: () => import('./integration/integration.module').then((m) => m.IntegrationModule) },
      { path: 'qc', loadChildren: () => import('./qc/qc.module').then((m) => m.QcModule) },
      { path: 'alert', loadChildren: () => import('./alert/alert.module').then((m) => m.AlertModule) },
      { path: 'transportation', loadChildren: () => import('./transportation/transportation.module').then((m) => m.TransportationModule) },
      { path: 'billing', loadChildren: () => import('./billing/billing.module').then((m) => m.BillingModule) },
      { path: 'work-task', loadChildren: () => import('./work-task/work-task.module').then((m) => m.WorkTaskModule) }
    ]
  },
  // passport
  { path: '', loadChildren: () => import('./passport/routes').then(m => m.routes) },
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  { path: '**', redirectTo: 'exception/404' }
];
