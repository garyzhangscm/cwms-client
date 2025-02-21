import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute , Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { TimeUnit } from '../../common/models/time-unit.enum';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { PrintingService } from '../../common/services/printing.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { ItemService } from '../../inventory/services/item.service';
import { Printer } from '../../report/models/printer';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Mould } from '../models/mould';
import { ProductionLine } from '../models/production-line';
import { ProductionLineCapacity } from '../models/production-line-capacity';
import { ProductionLineType } from '../models/production-line-type';
import { MouldService } from '../services/mould.service';
import { ProductionLineTypeService } from '../services/production-line-type.service';
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
    standalone: false
})
export class WorkOrderProductionLineMaintenanceComponent implements OnInit {

  currentProductionLine!: ProductionLine;
  stepIndex = 0;
  pageTitle: string;
  newProductionLine = true;

  availablePrinters: Printer[] = [];
  availableProductionLineTypes: ProductionLineType[] = [];


  // All UOM maintained in the system
  availableUnitOfMeasures: UnitOfMeasure[] = [];
  availableMoulds: Mould[] = [];

  listOfProductionLineCapacityItemData: ProductionLineCapacityItemData[] = [];
  productionLineCapacityItemDataIndex = 0;

  timeUnits = TimeUnit;

  isSpinning = false;


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private locationService: LocationService,
    private productionLineService: ProductionLineService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private printingService: PrintingService,
    private activatedRoute: ActivatedRoute,
    private unitOfMeasureService: UnitOfMeasureService,
    private productionLineTypeService: ProductionLineTypeService,
    private itemService: ItemService,
    private mouldService: MouldService) {
    this.pageTitle = this.i18n.fanyi('menu.main.production-line.maintenance');

    this.currentProductionLine = this.createEmptyProductionLine();
  }

  createEmptyProductionLine() {
    return {

      id: undefined,
      name: "",

      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: undefined,

      inboundStageLocationId: undefined,
      inboundStageLocation: this.createEmptyLocation(),
      outboundStageLocationId: undefined,
      outboundStageLocation: this.createEmptyLocation(),
      productionLineLocationId: undefined,
      productionLineLocation: this.createEmptyLocation(),

      productionLineAssignments: [],
      workOrderExclusiveFlag: false,
      enabled: false,
      genericPurpose: false,

      productionLineCapacities: [],
      model: "",
      staffCount: 0
    }
  }

  createEmptyLocation(): WarehouseLocation {
    return { 
      name: "",
      aisle: "",   
      locationGroup: undefined,
      enabled: true,
      locked: false, 
      reservedCode: "",
    }
  }

  ngOnInit(): void {


    this.availablePrinters = [];
    
    this.loadAvaiablePrinters();
    this.loadAvailableProductionLineTypes();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.isSpinning = true;
        // Get the production line by ID
        this.productionLineService.getProductionLine(params.id)
          .subscribe({
            next: (productionLine) => {
              this.currentProductionLine = productionLine;
              this.refreshListOfProductionLineCapacityItemData();
  
              this.newProductionLine = false;
              this.isSpinning = false;
            },
            error: () => this.isSpinning = false
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.isSpinning = true;
        this.refreshListOfProductionLineCapacityItemData();
        this.newProductionLine = true;
        this.isSpinning = false;
      }
    });


    this.unitOfMeasureService
      .loadUnitOfMeasures()
      .subscribe(unitOfMeasureRes => (this.availableUnitOfMeasures = unitOfMeasureRes));

    // Load all moulds
    this.mouldService.getMoulds().subscribe(mouldsRes =>
      this.availableMoulds = mouldsRes);
  }

  loadAvailableProductionLineTypes() : void {
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: (productionLineTypeRes) => this.availableProductionLineTypes = productionLineTypeRes
    })
  }
  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    if (this.warehouseService.getServerSidePrintingFlag() == true) {
      console.log(`will get printer from server`)
      this.printingService.getAllServerPrinters().subscribe(printers => {
        // this.availablePrinters = printers;
        printers.forEach(
          (printer, index) => {
            this.availablePrinters.push({
              id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
            });

          }); 
      })

    }
    else {

      console.log(`will get printer from local tools`)
      this.printingService.getAllLocalPrinters().forEach(
        (printer, index) => {
          this.availablePrinters.push({
            id: index, name: printer, description: printer, warehouseId: this.warehouseService.getCurrentWarehouse().id
          });

        });
    }

    //console.log(`availablePrinters: ${JSON.stringify(this.availablePrinters)}`);

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


  onProductionLineLocationChanged(name: string) {
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.productionLineLocation = res[0];
        this.currentProductionLine.productionLineLocationId = res[0].id;
      }

    });

  }
  onProductionLineInboundLocationChanged(name: string) {

    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.currentProductionLine.inboundStageLocation = res[0];
        this.currentProductionLine.inboundStageLocationId = res[0].id;
      }

    });

  }
  onProductionLineOutboundLocationChanged(name: string) {
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

  confirm(): void {
    // setup the production line's item
    this.currentProductionLine.productionLineCapacities = [];
    this.listOfProductionLineCapacityItemData.forEach(
      productionLineCapacityItemData => {
        this.currentProductionLine.productionLineCapacities.push(
          productionLineCapacityItemData.productionLineCapacity
        );
      }
    )
    this.isSpinning = true;
    if (this.newProductionLine) {

      this.productionLineService.addProductionLine(this.currentProductionLine)
        .subscribe(productionLine => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/production-line?name=${this.currentProductionLine.name}`);
          }, 500);
        });
    }
    else {

      this.productionLineService.changeProductionLine(this.currentProductionLine)
        .subscribe(productionLine => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/production-line?name=${this.currentProductionLine.name}`);
          }, 500);
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
          itemPackageTypes: [],
          companyId: this.companyService.getCurrentCompany()!.id
        },

        capacity: 0,
        unitOfMeasure: this.availableUnitOfMeasures.length > 0 ? this.availableUnitOfMeasures[0] : undefined,
        unitOfMeasureId: this.availableUnitOfMeasures.length > 0 ? this.availableUnitOfMeasures[0].id : undefined,

        mould: {
          name: "",
          description: "",
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

  itemNameChanged(itemName: string, productionLineCapacity: ProductionLineCapacity): void {
    this.itemService.getItems(itemName).subscribe(
      items => {
        if (items.length == 1) {
          productionLineCapacity.itemId = items[0].id;
          productionLineCapacity.item = items[0];
        }

      }
    )

  }
  mouldChanged(mouldName: string, productionLineCapacity: ProductionLineCapacity): void {
    this.mouldService.getMoulds(mouldName).subscribe(
      moulds => {
        if (moulds.length == 1) {
          productionLineCapacity.mould = moulds[0];
        }

      }
    )

  }
  unitOfMeasureChanged(unitOfMeasureName: string, productionLineCapacity: ProductionLineCapacity): void {

    this.availableUnitOfMeasures.filter(
      unitOfMeasure => unitOfMeasure.name === unitOfMeasureName)
      .forEach(unitOfMeasure => {
        productionLineCapacity.unitOfMeasure = unitOfMeasure;
        productionLineCapacity.unitOfMeasureId = unitOfMeasure.id;
      });
  }
  capacityUnitChanged(capacityUnit: string, productionLineCapacity: ProductionLineCapacity): void {

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
