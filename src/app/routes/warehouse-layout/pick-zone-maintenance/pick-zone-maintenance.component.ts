import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Department } from '../../auth/models/department';
import { PickZone } from '../models/pick-zone';
import { PickZoneService } from '../services/pick-zone.service';
import { WarehouseService } from '../services/warehouse.service';

@Component({
    selector: 'app-warehouse-layout-pick-zone-maintenance',
    templateUrl: './pick-zone-maintenance.component.html',
    standalone: false
})
export class WarehouseLayoutPickZoneMaintenanceComponent implements OnInit {

  currentPickZone!: PickZone;
  stepIndex = 0;
  pageTitle: string = "";
  newPickZone = true;
  isSpinning = false; 


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private pickZoneService: PickZoneService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('pick-zone');

    this.currentPickZone = this.createEmptyPickZone();
  }

  createEmptyPickZone(): PickZone {
    return {  
      warehouse: this.warehouseService.getCurrentWarehouse()!,
      name: "",
      description: "",
      pickable: false,
      allowCartonization: false,
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.pickZoneService.getPickZone(params.id)
          .subscribe(
            {
              next: (pickZoneRes) => {

                this.currentPickZone = pickZoneRes;

                this.newPickZone = false;
              }
            });  
      }
      else {
        
        this.newPickZone = true;
      }
    }); 

}


previousStep(): void {
    this.stepIndex -= 1;
}
nextStep(): void {
    this.stepIndex += 1;

}

confirm(): void {
    this.isSpinning = true;
    
    if (this.newPickZone) {

      this.pickZoneService.addPickZone(this.currentPickZone)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/warehouse-layout/pick-zone?name=${this.currentPickZone.name}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.pickZoneService.changePickZone(this.currentPickZone)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/warehouse-layout/pick-zone?name=${this.currentPickZone.name}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }
   


}
