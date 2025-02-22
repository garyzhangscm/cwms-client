import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration'; 
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { ItemService } from '../../inventory/services/item.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { OrderLine } from '../models/order-line';
import { Sortation } from '../models/sortation';
import { SortationByShipment } from '../models/sortation-by-shipment';
import { Wave } from '../models/wave';
import { SortationService } from '../services/sortation.service';
import { WaveService } from '../services/wave.service';

interface InventoryAttributes {
  color?: string;
  style?: string;
  productSize?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
}

@Component({
    selector: 'app-outbound-sortation',
    templateUrl: './sortation.component.html',
    standalone: false
})
export class OutboundSortationComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  gridStyle = {
    width: '33%',
    textAlign: 'center',
  };

  @ViewChild('barcodeInput')
  barcodeInput: ElementRef | undefined;

  isSpinning = false;
  waveNumber = "";
  currentWave?: Wave;
  currentWaveSortationLocations: WarehouseLocation[] = [];
  currentSortationLocationId?: number;
  currentBarcode = "";
  currentSortationShipmentId?: number;
  chooseInventoryAttributeModalVisible = false;

  sortationRequirementInventoryAttributes: InventoryAttributes[] = []; 

  currentSortation?: Sortation;
  
  inventoryConfiguration?: InventoryConfiguration;

  chooseInventoryAttributeTableColumns : STColumn[] = [];
  currentSortationItemId?: number;


  constructor(private http: _HttpClient,
    private waveService: WaveService,
    private sortationService: SortationService,
    private messageService: NzMessageService, 
    private router: Router,
    private inventoryConfigurationService: InventoryConfigurationService,
    private itemService: ItemService) { 

      inventoryConfigurationService.getInventoryConfigurations().subscribe({
        next: (inventoryConfigurationRes) => {
          if (inventoryConfigurationRes) { 
            this.inventoryConfiguration = inventoryConfigurationRes;
          } 
          this.setupChooseInventoryAttributeTableColumns();
        } , 
        error: () =>  this.setupChooseInventoryAttributeTableColumns()
      });
    
    }
  
  setupChooseInventoryAttributeTableColumns() {
    
    this.chooseInventoryAttributeTableColumns = [          
      { title: this.i18n.fanyi("color"),  index: 'color' ,
          sort: {
            compare: (a, b) => a.color.localeCompare(b.color)
          }, 
        }, 
      { title: this.i18n.fanyi("productSize"),  index: 'productSize' ,
          sort: {
            compare: (a, b) => a.productSize.localeCompare(b.productSize)
          }, 
        }, 
      { title: this.i18n.fanyi("style"),  index: 'style' ,
          sort: {
            compare: (a, b) => a.style.localeCompare(b.style)
          },
        },  
      { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
            this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
            index: 'attribute1' ,
            sort: {
              compare: (a, b) => a.attribute1.localeCompare(b.attribute1)
            }, 
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,    
              index: 'attribute2' ,
              sort: {
                compare: (a, b) => a.attribute2.localeCompare(b.attribute2)
              }, 
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute2Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,    
          index: 'attribute3' ,
          sort: {
            compare: (a, b) => a.attribute3.localeCompare(b.attribute3)
          }, 
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute3Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
          index: 'attribute4' ,
          sort: {
            compare: (a, b) => a.attribute4.localeCompare(b.attribute4)
          }, 
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute4Enabled == true,  },
      { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'attribute5' ,
              sort: {
                compare: (a, b) => a.attribute5.localeCompare(b.attribute5)
              }, 
          iif: () => this.inventoryConfiguration?.inventoryAttribute5Enabled == true,  },
          
      { title: this.i18n.fanyi("action"),  render: 'actionColumn' , 
        width: 350, },  
    ]; 

  }

  ngOnInit(): void { }

  waveNumberChanged() {
    if (this.waveNumber == "") {
      return;
    }
    this.isSpinning = true;
    this.waveService.getWaves(this.waveNumber, undefined, true, true).subscribe({
      next: (waveRes) => {
        if (waveRes.length == 1) {
          this.currentWave = waveRes[0];
          this.isSpinning = false;
          this.setupSortationLocations(this.currentWave);
        }
        else {
          this.currentWave = undefined;
          this.isSpinning = false;
          this.setupSortationLocations(this.currentWave);
        }
      },
      error: () => {
        this.currentWave = undefined;
        this.isSpinning = false;
        this.setupSortationLocations(this.currentWave);
      }
    })
  }

  setupSortationLocations(wave?: Wave) {
    this.currentWaveSortationLocations = [];
    this.currentSortationLocationId = undefined;
    this.currentSortation = undefined;

    if (wave == null) {
      // if we are not able to find a wave
      return;
    }

    this.isSpinning = true;
    this.waveService.getSortationLocations(wave.id!).subscribe({
      next: (locationRes) => {
        this.isSpinning = false;
        this.currentWaveSortationLocations = locationRes;
        if (this.currentWaveSortationLocations && this.currentWaveSortationLocations.length > 0) {
          this.currentSortationLocationId = this.currentWaveSortationLocations[0].id!
          this.loadWaveSortation(wave, this.currentSortationLocationId);
        }
      },
      error: () => {
        this.isSpinning = false;
        this.currentSortation = undefined;

      }
    })
  }

  loadWaveSortation(wave: Wave, locationId: number) {
    this.isSpinning = true;

    this.sortationService.getSortationByWave(wave.number, locationId).subscribe(
      {
        next: (sortationRes) => {
          this.isSpinning = false;
          // setup the quantities
          sortationRes.sortationByShipments.forEach(
            sortationByShipment => {
              this.setupSortationByShipmentQuantity(sortationByShipment);

            }
          )

          this.currentSortation = sortationRes;

        },
        error: () => this.isSpinning = false

      }

    )
  }

  setupSortationByShipmentQuantity(sortationByShipment: SortationByShipment) {
    sortationByShipment.totalExpectedQuantity = 0;
    sortationByShipment.totalArrivedQuantity = 0;
    sortationByShipment.totalSortedQuantity = 0;
    sortationByShipment.sortationByShipmentLines.forEach(
      sortationByShipmentLine => {
        sortationByShipment.totalExpectedQuantity! += sortationByShipmentLine.expectedQuantity;
        sortationByShipment.totalArrivedQuantity! += sortationByShipmentLine.arrivedQuantity;
        sortationByShipment.totalSortedQuantity! += sortationByShipmentLine.sortedQuantity;
      }
    )
  }

  currentSortationLocationChanged(locationId: number) {
    this.isSpinning = true;
    this.sortationService.getSortationByWave(this.currentWave!.number, locationId).subscribe(
      {
        next: (sortationRes) => {
          this.isSpinning = false;
          this.currentSortation = sortationRes;


        },
        error: () => this.isSpinning = false

      }

    )
  }
  selectBarcodeInput() {
    const inputElem = <HTMLInputElement>this.barcodeInput!.nativeElement;
    inputElem.select();
  }

  currentBarcodeChanged(event: Event) {

    let barcode = (event.target as HTMLInputElement).value;
    if (barcode == "") {
      return;
    }
    this.isSpinning = true;
    this.currentSortationShipmentId = undefined;

    this.itemService.findItemByBarcode(barcode).subscribe(
      {
        next: (itemsRes) => {
          this.isSpinning = false;
          if (itemsRes.length == 0) {
            this.messageService.error(`can't find item by barcode ${barcode}`);
            this.selectBarcodeInput();

          }
          else if (itemsRes.length == 1) {
            // we get the item from the barcode, let's sort and then highlight
            // the shipment 
            this.isSpinning = true;
            this.sortationService.findPickedInventoryByItem(
              this.currentWave!.number,
              this.currentSortationLocationId!,
              itemsRes[0].id!
            ).subscribe({
              next: (pickedInventoryRes) => {
                if (pickedInventoryRes.length == 0) {

                  this.messageService.error(`no inventory with item ${barcode} is picked into the sort location yet`);
                  this.selectBarcodeInput();
                }
                else {
                  // we got picked inventory, let's see if 
                  // we will need to let the user choose the item's attribute to continue
                  if (this.needMoreInventoryAttributeInformationForSorting(itemsRes[0].id!, this.currentSortation!)) {

                    this.showCaptureInventoryAttributeModal(itemsRes[0].id!, pickedInventoryRes)

                  }
                  else {

                    this.sortationService.processWaveSortationByItem(
                      this.currentSortation!.number, itemsRes[0].id!,
                      pickedInventoryRes[0].color,
                      pickedInventoryRes[0].style,
                      pickedInventoryRes[0].productSize,
                      pickedInventoryRes[0].attribute1,
                      pickedInventoryRes[0].attribute2,
                      pickedInventoryRes[0].attribute3,
                      pickedInventoryRes[0].attribute4,
                      pickedInventoryRes[0].attribute5).subscribe({
                        next: (sortationByShipmentLineRes) => {
                          this.isSpinning = false;
                          // setup the shipment id that match with the item so that we can 
                          // highlight the block for the shipment and guide the user to sort
                          // the item
                          this.currentSortationShipmentId = sortationByShipmentLineRes.shipmentId;
                          // update the quantity;
                          this.refreshSortation(sortationByShipmentLineRes.id!);
                          this.currentBarcode = "";
                          this.selectBarcodeInput();

                        },
                        error: () => this.isSpinning = false

                      });
                  }

                }

              },
              error: () => this.isSpinning = false

            })

          }
          else {
            // there're multiple items found by the barcode, let's 
            // TO-DO: prompt a page to let the user choose an item
          }



        },
        error: () => {
          this.isSpinning = false

        }

      }

    )

  }

  showCaptureInventoryAttributeModal(itemId: number, inventories: Inventory[]) {
    // let's get different attribute so that we can let the user choose one
    
    let attributeStringSet: Set<string> = new Set<string>();
    let attributeSet: Set<InventoryAttributes> = new  Set<InventoryAttributes>();
    inventories.forEach(
      inventory => {
        let inventoryAttributeString = this.getInventoryAttributes(inventory);
        if (!attributeStringSet.has(inventoryAttributeString))  {
          attributeStringSet.add(inventoryAttributeString);
          attributeSet.add({
            color: inventory.color,
            style: inventory.style,
            productSize: inventory.productSize,
            attribute1: inventory.attribute1,
            attribute2: inventory.attribute2,
            attribute3: inventory.attribute3,
            attribute4: inventory.attribute4,
            attribute5: inventory.attribute5,
          });
        }
      }
    )

    this.sortationRequirementInventoryAttributes = [...attributeSet]; 
    this.chooseInventoryAttributeModalVisible = true;
    this.currentSortationItemId = itemId;

    // show the model so that the user can choose one



  }

  sortWithAttribute(chosenInventoryAttribute: InventoryAttributes) {
    console.log(`use inventory attriubte to sort : ${chosenInventoryAttribute}`); 
    
    this.chooseInventoryAttributeModalVisible = false;
    this.isSpinning = true;

    this.sortationService.processWaveSortationByItem(
      this.currentSortation!.number, this.currentSortationItemId!,
      chosenInventoryAttribute.color,
      chosenInventoryAttribute.style,
      chosenInventoryAttribute.productSize,
      chosenInventoryAttribute.attribute1,
      chosenInventoryAttribute.attribute2,
      chosenInventoryAttribute.attribute3,
      chosenInventoryAttribute.attribute4,
      chosenInventoryAttribute.attribute5).subscribe({
        next: (sortationByShipmentLineRes) => {
          this.isSpinning = false;
          // setup the shipment id that match with the item so that we can 
          // highlight the block for the shipment and guide the user to sort
          // the item
          this.currentSortationShipmentId = sortationByShipmentLineRes.shipmentId;
          // update the quantity;
          this.refreshSortation(sortationByShipmentLineRes.id!);
          this.currentBarcode = "";
          this.selectBarcodeInput();

        },
        error: () => this.isSpinning = false

      });
  }
  cancelChoosingInventoryAttribute() {
    this.chooseInventoryAttributeModalVisible = false;
    
    this.messageService.error(`cancel current operation as there's no inventory attribute is chosen`);
    this.selectBarcodeInput();

  }

  needMoreInventoryAttributeInformationForSorting(itemId: number,
    sortation: Sortation): boolean {
    // we will assume all the inventory should have the same item 
    // if there's only only shipment has the item id , then
    // we won't need more inventory attribute information 
    // we will only need more inventory attribute only if 
    // there're mulitple shipment has the same item but they have different
    // attribute
    let shipmentIdSet: Set<number> = new Set<number>();
    let attributeRequiredSet: Set<string> = new Set<string>();
    sortation.sortationByShipments.forEach(
      sortationByShipment => {
        sortationByShipment.sortationByShipmentLines.forEach(
          sortationByShipmentLine => {
            if (sortationByShipmentLine.shipmentLine.orderLine.itemId == itemId) {
              shipmentIdSet.add(sortationByShipment.shipmentId);
              attributeRequiredSet.add(
                this.getRequiredInventoryAttributes(sortationByShipmentLine.shipmentLine.orderLine));
            }
          }
        )
      }
    )

    if (shipmentIdSet.size <= 1) {
      // only one shipment needs the item

      return false;

    }
    if (attributeRequiredSet.size <= 1) {
      // we have multiple shipments that need the item but
      // all of them have the same requirement
      return false;
    }


    return true;
  }

  getRequiredInventoryAttributes(orderLine: OrderLine): string {
    return (orderLine.color ? orderLine.color : "----") +
      "_" +
      (orderLine.style ? orderLine.style : "----") +
      "_" +
      (orderLine.productSize ? orderLine.productSize : "----") +
      "_" +
      (orderLine.inventoryAttribute1 ? orderLine.inventoryAttribute1 : "----") +
      "_" +
      (orderLine.inventoryAttribute2 ? orderLine.inventoryAttribute2 : "----") +
      "_" +
      (orderLine.inventoryAttribute3 ? orderLine.inventoryAttribute3 : "----") +
      "_" +
      (orderLine.inventoryAttribute4 ? orderLine.inventoryAttribute4 : "----") +
      "_" +
      (orderLine.inventoryAttribute5 ? orderLine.inventoryAttribute5 : "----");
  }

  getInventoryAttributes(inventory: Inventory): string {
    return (inventory.color ? inventory.color : "----") +
      "_" +
      (inventory.style ? inventory.style : "----") +
      "_" +
      (inventory.productSize ? inventory.productSize : "----") +
      "_" +
      (inventory.attribute1 ? inventory.attribute1 : "----") +
      "_" +
      (inventory.attribute2 ? inventory.attribute2 : "----") +
      "_" +
      (inventory.attribute3 ? inventory.attribute3 : "----") +
      "_" +
      (inventory.attribute4 ? inventory.attribute4 : "----") +
      "_" +
      (inventory.attribute5 ? inventory.attribute5 : "----");
  }

  refreshSortation(lastSortationByShipmentLineId: number) {
    let matchedSortationByShipment = undefined;
    this.currentSortation?.sortationByShipments.forEach(
      sortationByShipment => {
        sortationByShipment.sortationByShipmentLines.forEach(
          sortationByShipmentLine => {
            // ok, we found the last sorted shipment line, let's update the quantity
            // by 1
            if (lastSortationByShipmentLineId == sortationByShipmentLine.id!) {
              sortationByShipmentLine.sortedQuantity += 1;
              matchedSortationByShipment = sortationByShipment;
            }
          }
        )
      }
    );

    // refresh the quantity after we sort one item for this shipment
    // so the right quantity and progress will be reflect in the screen
    if (matchedSortationByShipment != null) {
      this.setupSortationByShipmentQuantity(matchedSortationByShipment);
    }
  }


  startSortByShipment(sortationByShipment: SortationByShipment) {
    console.log(`start to sort by shipment ${JSON.stringify(sortationByShipment)}`)

    this.router.navigateByUrl(`/outbound/sortation/by-shipment?id=${sortationByShipment.id!}`);
    console.log(`nagvate`);
  }

}
