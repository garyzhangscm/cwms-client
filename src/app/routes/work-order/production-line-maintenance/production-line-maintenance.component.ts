import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';

@Component({
  selector: 'app-work-order-production-line-maintenance',
  templateUrl: './production-line-maintenance.component.html',
})
export class WorkOrderProductionLineMaintenanceComponent implements OnInit {

  currentProductionLine: ProductionLine;
  stepIndex = 0;
  pageTitle: string;
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private locationService: LocationService,
    private productionLineService: ProductionLineService,
    private messageService: NzMessageService,
    private router: Router,
    private i18n: I18NService ) { 
      this.pageTitle = this.i18n.fanyi('menu.main.production-line.maintenance');
    this.currentProductionLine = {
      
      id: undefined,
      name: "",

      warehouseId: warehouseService.getCurrentWarehouse().id,
      warehouse: undefined,

      inboundStageLocationId: undefined,
      inboundStageLocation: this.createEmptyLocation(),
      outboundStageLocationId: undefined,
      outboundStageLocation:   this.createEmptyLocation(),
      productionLineLocationId: undefined,
      productionLineLocation:   this.createEmptyLocation(),

      productionLineAssignments: [],
      workOrderExclusiveFlag: false,
      enabled: false

    }
  }

  createEmptyLocation() :WarehouseLocation{
    return {
      id: -9999,
      name: "",
      aisle: "",
      x: -9999,
      y: -9999,
      z: -9999,
      length: -9999,
      width:-9999,
      height:-9999,
      pickSequence: -9999,
      putawaySequence: -9999,
      countSequence: -9999,
      capacity: -9999,
      fillPercentage:-9999,
      currentVolume: -9999,
      pendingVolume: -9999,
      locationGroup: undefined,
      enabled: false,
      locked: true,
      reservedCode: "",
    }
  }

  ngOnInit(): void { }


  processProductionLineLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName} `);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.productionLineLocation = res[0];
        this.currentProductionLine.productionLineLocationId = res[0].id;
      }

    });
  }
  
  processProductionLineInboundLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with inbound location name ${selectedLocationName} `);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.inboundStageLocation = res[0];
        this.currentProductionLine.inboundStageLocationId = res[0].id;
      }
      
    });
  }
  
  processProductionLineOutboundLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with outbound location name ${selectedLocationName} `);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.outboundStageLocation = res[0];
        this.currentProductionLine.outboundStageLocationId = res[0].id;
      }
      
    });
  }


  onProductionLineLocationChanged(name: string){
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.productionLineLocation = res[0];
        this.currentProductionLine.productionLineLocationId = res[0].id;
      }
      
    });

  }
  onProductionLineInboundLocationChanged(name: string){
    
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.inboundStageLocation = res[0];
        this.currentProductionLine.inboundStageLocationId = res[0].id;
      }
      
    });

  }
  onProductionLineOutboundLocationChanged(name: string){
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.outboundStageLocation = res[0];
        this.currentProductionLine.outboundStageLocationId = res[0].id;
      }
      
    });
  }


  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void { 
    this.stepIndex += 1;

  }

  confirm(): void{
    
    this.productionLineService.addProductionLine(this.currentProductionLine)
    .subscribe(productionLine => {
      this.messageService.success(this.i18n.fanyi('message.save.complete'));
      setTimeout(() => {
        this.router.navigateByUrl(`/work-order/production-line?name=${this.currentProductionLine.name}`);
      }, 2500);
  }); 
  }
}
