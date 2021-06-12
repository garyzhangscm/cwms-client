import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TimeUnit } from '../../common/models/time-unit.enum';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { ItemService } from '../../inventory/services/item.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Mould } from '../models/mould';
import { ProductionLine } from '../models/production-line';
import { ProductionLineCapacity } from '../models/production-line-capacity';
import { MouldService } from '../services/mould.service';
import { ProductionLineService } from '../services/production-line.service';



interface ProductionLineCapacityItemData {
  id: string;
  edit: boolean;
  productionLineCapacity: ProductionLineCapacity;
  
}

@Component({
  selector: 'app-work-order-production-line-maintenance',
  templateUrl: './production-line-maintenance.component.html',
  styleUrls: ['./production-line-maintenance.component.less'],
})
export class WorkOrderProductionLineMaintenanceComponent implements OnInit {

  currentProductionLine!: ProductionLine;
  stepIndex = 0;
  pageTitle: string;
  newProductionLine = true;
  
  
  // All UOM maintained in the system
  availableUnitOfMeasures: UnitOfMeasure[] = [];
  availableMoulds: Mould[] = [];
   
  listOfProductionLineCapacityItemData: ProductionLineCapacityItemData[] = [];
  productionLineCapacityItemDataIndex = 0;

  timeUnits = TimeUnit;
  

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private locationService: LocationService,
    private productionLineService: ProductionLineService,
    private messageService: NzMessageService,
    private router: Router,
    private i18n: I18NService,
    private activatedRoute: ActivatedRoute,
    private unitOfMeasureService: UnitOfMeasureService, 
    private itemService: ItemService, 
    private mouldService: MouldService) { 
      this.pageTitle = this.i18n.fanyi('menu.main.production-line.maintenance');  
      
      this.currentProductionLine = this.createEmptyProductionLine();
  }

  createEmptyProductionLine() {
    return  {
      
      id: undefined,
      name: "",

      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: undefined,

      inboundStageLocationId: undefined,
      inboundStageLocation: this.createEmptyLocation(),
      outboundStageLocationId: undefined,
      outboundStageLocation:   this.createEmptyLocation(),
      productionLineLocationId: undefined,
      productionLineLocation:   this.createEmptyLocation(),

      productionLineAssignments: [],
      workOrderExclusiveFlag: false,
      enabled: false,
      genericPurpose: false,
          
      productionLineCapacities: [],
      model: "",
      staffCount: 0
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

  ngOnInit(): void {

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.productionLineService.getProductionLine(params.id)
            .subscribe(productionLine => {
              this.currentProductionLine = productionLine;
              this.refreshListOfProductionLineCapacityItemData();
                
              this.newProductionLine = false;
            });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.refreshListOfProductionLineCapacityItemData();
        this.newProductionLine = true;
      }
    });

    
    this.unitOfMeasureService
      .loadUnitOfMeasures()
      .subscribe(unitOfMeasureRes => (this.availableUnitOfMeasures = unitOfMeasureRes));

    // Load all moulds
    this.mouldService.getMoulds().subscribe(mouldsRes =>
      this.availableMoulds = mouldsRes);
  }

  refreshListOfProductionLineCapacityItemData() {
      
    this.listOfProductionLineCapacityItemData = [];
    this.productionLineCapacityItemDataIndex = 0;
    
    this.currentProductionLine.productionLineCapacities.forEach(
      productionLineCapacity => {
        
        this.addProductionLineCapacityItemData(productionLineCapacity);
        

      }
    )

  }

  processProductionLineLocationQueryResult(selectedLocationName: any): void { 
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.productionLineLocation = res[0];
        this.currentProductionLine.productionLineLocationId = res[0].id;
      }

    });
  }
  
  processProductionLineInboundLocationQueryResult(selectedLocationName: any): void { 
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.inboundStageLocation = res[0];
        this.currentProductionLine.inboundStageLocationId = res[0].id;
      }
      
    });
  }
  
  processProductionLineOutboundLocationQueryResult(selectedLocationName: any): void { 
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
    // setup the production line's item
    this.currentProductionLine.productionLineCapacities = [];
    this.listOfProductionLineCapacityItemData.forEach(
      productionLineCapacityItemData => {
        this.currentProductionLine.productionLineCapacities.push(
          productionLineCapacityItemData.productionLineCapacity
        );
      }
    ) 
    if (this.newProductionLine) {

      this.productionLineService.addProductionLine(this.currentProductionLine)
      .subscribe(productionLine => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.router.navigateByUrl(`/work-order/production-line?name=${this.currentProductionLine.name}`);
          }, 2500);
      }); 
    }
    else {
      
      this.productionLineService.changeProductionLine(this.currentProductionLine)
      .subscribe(productionLine => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.router.navigateByUrl(`/work-order/production-line?name=${this.currentProductionLine.name}`);
          }, 2500);
      }); 
    }
  }

   


  addEmptyProductionLineCapacityItemData() {
    this.addProductionLineCapacityItemData(
      {
          
        
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        itemId: undefined,

        item: { 
          name: "",
          description: "", 
          itemPackageTypes: []
        },

        capacity: 0,
        unitOfMeasure: this.availableUnitOfMeasures.length > 0 ? this.availableUnitOfMeasures[0] : undefined,
        unitOfMeasureId: this.availableUnitOfMeasures.length > 0 ? this.availableUnitOfMeasures[0].id : undefined,

        mould: {
          name: "",
          description:"",
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
        },
        capacityUnit: TimeUnit.HOUR,
      },
       true
    )
  }
  addProductionLineCapacityItemData(productionLineCapacity: ProductionLineCapacity, edit: boolean = false): void {
     

    this.listOfProductionLineCapacityItemData = [
      ...this.listOfProductionLineCapacityItemData,
      { 
          id: `${this.productionLineCapacityItemDataIndex}`,
          edit: edit, 
          productionLineCapacity: productionLineCapacity
      }
    ]; 
    this.productionLineCapacityItemDataIndex++;
  }

  deleteProductionLineCapacityItemData(id: string): void {
    this.listOfProductionLineCapacityItemData = 
        this.listOfProductionLineCapacityItemData.filter(d => d.id !== id);
  }
  
  itemNameChanged(itemName: string, productionLineCapacity: ProductionLineCapacity) : void { 
    this.itemService.getItems(itemName).subscribe(
      items => {
        if (items.length == 1) {
          productionLineCapacity.itemId = items[0].id;
          productionLineCapacity.item = items[0];
        }
       
      }
    )

  }
  mouldChanged(mouldName: string, productionLineCapacity: ProductionLineCapacity) : void { 
    this.mouldService.getMoulds(mouldName).subscribe(
      moulds => {
        if (moulds.length == 1) { 
          productionLineCapacity.mould = moulds[0];
        }
       
      }
    )

  }
  unitOfMeasureChanged(unitOfMeasureName: string, productionLineCapacity: ProductionLineCapacity) : void {
 
    this.availableUnitOfMeasures.filter(
      unitOfMeasure => unitOfMeasure.name === unitOfMeasureName)
      .forEach(unitOfMeasure => { 
        productionLineCapacity.unitOfMeasure = unitOfMeasure;
        productionLineCapacity.unitOfMeasureId = unitOfMeasure.id;
      });
  }
  capacityUnitChanged(capacityUnit: string, productionLineCapacity: ProductionLineCapacity) : void { 
    
    productionLineCapacity.capacityUnit = TimeUnit[capacityUnit as keyof typeof TimeUnit];

  }
  
  

  deleteRecord(id: string): void {
    this.listOfProductionLineCapacityItemData = this.listOfProductionLineCapacityItemData.filter(
      productionLineCapacityItemData => productionLineCapacityItemData.id != id
    );
  }

  saveRecord(id: string): void {
    
    const index = this.listOfProductionLineCapacityItemData.findIndex(item => item.id === id);

    this.listOfProductionLineCapacityItemData[index].edit = false;
  }

}
