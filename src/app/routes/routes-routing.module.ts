import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleGuard } from '@delon/auth';
import { environment } from '@env/environment';

// layout
import { LayoutBasicComponent } from '../layout/basic/basic.component';
import { LayoutBlankComponent } from '../layout/blank/blank.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [SimpleGuard],
    canActivateChild: [SimpleGuard],
    data: {},
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      {
        path: 'widgets',
        loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule)
      },
      { path: 'style', loadChildren: () => import('./style/style.module').then(m => m.StyleModule) },
      { path: 'delon', loadChildren: () => import('./delon/delon.module').then(m => m.DelonModule) },
      { path: 'extras', loadChildren: () => import('./extras/extras.module').then(m => m.ExtrasModule) },
      { path: 'pro', loadChildren: () => import('./pro/pro.module').then(m => m.ProModule) },
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
      { path: 'qc', loadChildren: () => import('./qc/qc.module').then((m) => m.QcModule) },]
  },
  // Blak Layout 空白布局
  {
    path: 'data-v',
    component: LayoutBlankComponent,
    children: [{ path: '', loadChildren: () => import('./data-v/data-v.module').then(m => m.DataVModule) }]
  },
  // passport
  { path: '', loadChildren: () => import('./passport/passport.module').then(m => m.PassportModule) },
  { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
  { path: '**', redirectTo: 'exception/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
      // Pls refer to https://ng-alain.com/components/reuse-tab
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [RouterModule]
})
export class RouteRoutingModule { }
