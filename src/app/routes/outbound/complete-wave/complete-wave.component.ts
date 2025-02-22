import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { CustomerService } from '../../common/services/customer.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service'; 
import { ShipmentLine } from '../models/shipment-line'; 
import { Wave } from '../models/wave';
import { WaveStatus } from '../models/wave-status.enum';
import { PickService } from '../services/pick.service';
import { ShipmentLineService } from '../services/shipment-line.service';
import { WaveService } from '../services/wave.service';

@Component({
    selector: 'app-outbound-complete-wave',
    templateUrl: './complete-wave.component.html',
    styleUrls: ['./complete-wave.component.less'],
    standalone: false
})
export class OutboundCompleteWaveComponent implements OnInit {

  pageTitle: string;
  
  completelyStagedShipmentLines : ShipmentLine[] = [];
  uncompletelyStagedShipmentLines : ShipmentLine[] = [];
  isSpinning = false;
  inventoryConfiguration?: InventoryConfiguration;

  waveStatusList = WaveStatus;
  
  shipmentLineTableColumns: STColumn[] = [];
  setupOrderLineTableColumns() {

    this.shipmentLineTableColumns = [    

      { title: this.i18n.fanyi("shipment.number"), index: 'shipmentNumber' , width: 150, 
        sort: {
          compare: (a, b) => a.shipmentNumber.localeCompare(b.shipmentNumber)
        },
        filter: {
          menus:  [] ,
          fn: (filter, record) => record.shipmentNumber === filter.value,
          multiple: true
        }
      },     
      { title: this.i18n.fanyi("order.number"), index: 'orderNumber' , width: 150, 
        sort: {
          compare: (a, b) => a.orderNumber.localeCompare(b.orderNumber)
        },
        filter: {
          menus:  [] ,
          fn: (filter, record) => record.orderNumber ===  filter.value,
          multiple: true
        }
      },
      { title: this.i18n.fanyi("item"), index: 'orderLine.item.name' , width: 150, 
        sort: {
          compare: (a, b) => a.orderLine.item.name.localeCompare(b.orderLine.item.name)
        },
        filter: {
          menus:  [] ,
          fn: (filter, record) => record.orderLine.item.name ===  filter.value,
          multiple: true
        }
      },
      { title: this.i18n.fanyi("style"), index: 'orderLine.style' , width: 150, 
        sort: {
          compare: (a, b) => a.orderLine.style.localeCompare(b.orderLine.style)
        },
        filter: {
          menus:  [] ,
          fn: (filter, record) => record.orderLine.style ===  filter.value,
          multiple: true
        }
      },
      { title: this.i18n.fanyi("color"), index: 'orderLine.color' , width: 150, 
        sort: {
          compare: (a, b) => a.orderLine.color.localeCompare(b.orderLine.color)
        },
        filter: {
          menus:  [] ,
          fn: (filter, record) => record.orderLine.color ===  filter.value,
          multiple: true
        }
      },
      { title: this.i18n.fanyi("quantity"), index: 'quantity', width: 150, 
        sort: {
          compare: (a, b) => a.quantity - b.quantity
        },
      },  
      { title: this.i18n.fanyi("openQuantity"), index: 'openQuantity' , width: 150, 
        sort: {
          compare: (a, b) => a.openQuantity - b.openQuantity
        },
      },  
      { title: this.i18n.fanyi("inprocessQuantity"), index: 'inprocessQuantity' , width: 150, 
        sort: {
          compare: (a, b) => a.inprocessQuantity - b.inprocessQuantity
        },
      },   
      { title: this.i18n.fanyi("stagedQuantity"), index: 'stagedQuantity', width: 150 , 
        sort: {
          compare: (a, b) => a.stagedQuantity - b.stagedQuantity
        },
      },  
      { title: this.i18n.fanyi("loadedQuantity"), index: 'loadedQuantity', width: 150 , 
        sort: {
          compare: (a, b) => a.loadedQuantity - b.loadedQuantity
        },
      },  
      { title: this.i18n.fanyi("shippedQuantity"), index: 'shippedQuantity', width: 150, 
        sort: {
          compare: (a, b) => a.shippedQuantity - b.shippedQuantity
        },
      },       
    
    ];
  }
  currentWave: Wave | undefined;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private waveService: WaveService,
    private message: NzMessageService,
    private router: Router,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private customerService: CustomerService, 
    private shipmentLineService: ShipmentLineService,
    private pickService: PickService,
    private inventoryConfigurationService: InventoryConfigurationService,
    ) { 
    this.pageTitle = this.i18n.fanyi('page.outbound.wave.title');

    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        } 
        this.setupOrderLineTableColumns();
      } , 
      error: () =>  this.setupOrderLineTableColumns()
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.outbound.wave.title'));
  

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.loadWave(params['id']);
      }
    });
  }
  loadWave(waveId: number): void {  
    this.isSpinning = true;
    this.waveService.getWave(waveId).subscribe({
      next: (waveRes)=> {  
        this.currentWave = waveRes; 
        this.isSpinning = false;
        this.loadShipmentLines(this.currentWave.id!); 
      }, 
      error: () => this.isSpinning = false 
    });
  }
   
  setupWaveQuantities(wave: Wave): Wave {
    let totalQuantity = 0;
    let totalOpenQuantity = 0;
    let totalInprocessQuantity = 0;
    let totalPickedQuantity = 0;
    let totalStagedQuantity = 0;
    let totalShippedQuantity = 0;

    const existingItemIds = new Set();
    const existingOrderNumbers = new Set();
    const existingOrderLineIds = new Set();

    wave.shipmentLines.forEach(shipmentLine => {
      totalQuantity += shipmentLine.quantity;
      totalOpenQuantity += shipmentLine.openQuantity;
      totalInprocessQuantity += shipmentLine.inprocessQuantity;
      shipmentLine.picks.forEach(pick => (totalPickedQuantity += pick.pickedQuantity));
      totalStagedQuantity += shipmentLine.stagedQuantity;
      totalShippedQuantity += shipmentLine.shippedQuantity;

      if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
        existingItemIds.add(shipmentLine.orderLine.itemId);
      }
      if (!existingOrderNumbers.has(shipmentLine.orderNumber)) {
        existingOrderNumbers.add(shipmentLine.orderNumber);
      }
      if (!existingOrderLineIds.has(shipmentLine.orderLine.id)) {
        existingOrderLineIds.add(shipmentLine.orderLine.id);
      }
    });

    wave.totalOrderCount = existingOrderNumbers.size;
    wave.totalOrderLineCount = existingOrderLineIds.size;
    wave.totalItemCount = existingItemIds.size;

    wave.totalQuantity = totalQuantity;
    wave.totalOpenQuantity = totalOpenQuantity;
    wave.totalInprocessQuantity = totalInprocessQuantity;
    wave.totalPickedQuantity = totalPickedQuantity;
    wave.totalStagedQuantity = totalStagedQuantity;
    wave.totalShippedQuantity = totalShippedQuantity;
    return wave;
  }
  
  returnToPreviousPage(): void {
    if (this.currentWave) {
     
     this.router.navigateByUrl(`outbound/wave?number=${this.currentWave.number}`); 
    }
    else {
     this.router.navigateByUrl(`outbound/wave`); 

    }
 }

  loadShipmentLines(waveId: number): void {
    this.isSpinning = true;
    
    this.shipmentLineService.getShipmentLinesByWave(waveId).subscribe({
      next: (shipmentLineRes) => {
        this.currentWave!.shipmentLines = shipmentLineRes;
        this.setupWaveQuantities(this.currentWave!);

        this.pickService.getPicksByWave(waveId).subscribe({
          next: (pickRes) => {
            //console.log(`pickRes.length: ${pickRes.length}`);
            if (pickRes.length === 0) {
                this.setupShipmentLines([], shipmentLineRes);
                this.isSpinning = false;
            } else {
              this.pickService.getPickedInventories(pickRes).subscribe({
                next: (pickedInventoryRes) => {
                  //console.log(`pickedInventoryRes.length: ${pickedInventoryRes.length}`);
                  this.setupShipmentLines(pickedInventoryRes, shipmentLineRes);
                  this.isSpinning = false;
                }, 
                error: () => this.isSpinning = false  
              });
            }
          },
          error: () => this.isSpinning = false  
        })
      }, 
      error: () => this.isSpinning = false
    });
  } 

  setupShipmentLines(pickedInventory: Inventory[], shipmentLines: ShipmentLine[]) {
    // calculate the staged quantity based on the picked inventory
    // key: pick id
    // value: quantity
    let stagedInventoryQuantityByPickMap = new Map<number, number>()
    pickedInventory.forEach(
      inventory => {
        if (stagedInventoryQuantityByPickMap.has(inventory.pickId!)) {
          let quantity = stagedInventoryQuantityByPickMap.get(inventory.pickId!);
          stagedInventoryQuantityByPickMap.set(inventory.pickId!, quantity! + inventory.quantity!)
        }
        else {          
          stagedInventoryQuantityByPickMap.set(inventory.pickId!, inventory.quantity!)
        }
      }
    )
    shipmentLines.forEach(
      shipmentLine => {
        let totalStagedQuantity: number = 0;
        shipmentLine.picks.forEach(
          pick => {
            if (stagedInventoryQuantityByPickMap.has(pick.id)) {
              totalStagedQuantity += stagedInventoryQuantityByPickMap.get(pick.id)!
            }
          }
        );
        shipmentLine.stagedQuantity = totalStagedQuantity;
      }
    )

    this.completelyStagedShipmentLines = shipmentLines.filter(shipmentLine => shipmentLine.quantity <= shipmentLine.stagedQuantity);
    this.uncompletelyStagedShipmentLines = shipmentLines.filter(shipmentLine => shipmentLine.quantity > shipmentLine.stagedQuantity);
    // console.log(`this.completelyStagedShipmentLines: ${this.completelyStagedShipmentLines.length}, this.uncompletelyStagedShipmentLines: ${this.uncompletelyStagedShipmentLines.length}`)
              

  }

  completeWave(){
    this.isSpinning = true;
    
    this.waveService.completeWave(this.currentWave!.id!).subscribe({

      next: (waveRes) => {
        this.message.success(this.i18n.fanyi("message.action.success"));
        this.currentWave = waveRes;
        this.isSpinning = false;
        // refresh the page 
        this.loadShipmentLines(this.currentWave!.id!);
      },
      error: () => this.isSpinning = false
    })
  }
}
