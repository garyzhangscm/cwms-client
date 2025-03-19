import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountDownModule } from '@delon/abc/count-down';
import { OnboardingModule } from '@delon/abc/onboarding';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { QuickMenuModule } from '@delon/abc/quick-menu';
import { G2BarModule } from '@delon/chart/bar';
import { G2CardModule } from '@delon/chart/card';
import { G2GaugeModule } from '@delon/chart/gauge';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2MiniProgressModule } from '@delon/chart/mini-progress';
import { NumberInfoModule } from '@delon/chart/number-info';
import { G2PieModule } from '@delon/chart/pie';
import { G2RadarModule } from '@delon/chart/radar';
import { G2SingleBarModule } from '@delon/chart/single-bar';
import { G2TagCloudModule } from '@delon/chart/tag-cloud';
import { G2TimelineModule } from '@delon/chart/timeline';
import { TrendModule } from '@delon/chart/trend';
import { G2WaterWaveModule } from '@delon/chart/water-wave'; 
import { I18nPipe } from '@delon/theme';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { CountdownModule } from 'ngx-countdown';
 
import { DashboardRoutingModule } from './dashboard-routing.module'; 
import { DashboardWelcomeComponent } from './welcome/welcome.component'; 

const COMPONENTS = [   
  DashboardWelcomeComponent];

@NgModule({
  imports: [ 
    DashboardRoutingModule,
    CountDownModule,
    CountdownModule,
    G2BarModule,
    G2CardModule,
    G2GaugeModule,
    G2MiniAreaModule,
    G2MiniBarModule,
    G2MiniProgressModule,
    G2PieModule,
    G2RadarModule,
    G2SingleBarModule,
    G2TagCloudModule,
    G2TimelineModule,
    G2WaterWaveModule,
    NumberInfoModule,
    TrendModule,
    QuickMenuModule,
    OnboardingModule,
    NzStatisticModule,
    PageHeaderComponent ,
    NzCardModule ,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    CommonModule,
    NzSpinModule,
    I18nPipe,
  ],
  declarations: [...COMPONENTS]
})
export class DashboardModule {}
