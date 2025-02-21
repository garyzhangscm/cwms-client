import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { ItemService } from '../../inventory/services/item.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { Shipment } from '../models/shipment';
import { SortationByShipment } from '../models/sortation-by-shipment';
import { SortationByShipmentLine } from '../models/sortation-by-shipment-line';
import { Wave } from '../models/wave';
import { ShipmentService } from '../services/shipment.service';
import { SortationService } from '../services/sortation.service';

@Component({
    selector: 'app-outbound-sortation-by-shipment',
    templateUrl: './sortation-by-shipment.component.html',
    styleUrls: ['./sortation-by-shipment.component.less'],
    standalone: false
})
export class OutboundSortationByShipmentComponent implements OnInit {
   

  isSpinning = false; 
  currentShipment?: Shipment;
  currentBarcode = "";
  currentSortationByShipment?: SortationByShipment;

  accessFromMenu = false;
  searchForm!: UntypedFormGroup;

  loadingShipmentLineDetailsRequest = 0;
  
  @ViewChild('sortationByShipmentTable', { static: false })
  sortationByShipmentTable!: STComponent;

  sortationByShipmentTableColumns: STColumn[] = [
    
    {
      title: this.i18n.fanyi("item.name"),  index: 'itemName' , 
    },    
    
    {
      title: this.i18n.fanyi("expectedQuantity"),  index: 'expectedQuantity' , 
    },    
    {
      title: this.i18n.fanyi("arrivedQuantity"),  index: 'arrivedQuantity' , 
    },    
    {
      title: this.i18n.fanyi("sortedQuantity"),  index: 'sortedQuantity' , 
    },    
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn',
      width: 150,
      fixed: 'right',
    }
  ]; 

  constructor(private http: _HttpClient, 
    private fb: UntypedFormBuilder,
    private shipmentService: ShipmentService, 
    private sortationService: SortationService, 
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private localCacheService: LocalCacheService,
    private itemService: ItemService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private router: Router ) {   
  }

  ngOnInit(): void {
     

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id != null) {
        this.accessFromMenu = false;
        this.loadShipmentBySortation(params.id)

      }
      else {
        this.accessFromMenu = true;
        this.initSearchForm();
      }
    });
  }

  initSearchForm() {
    
    this.searchForm = this.fb.group({
      orderNumber: [null], 
    });
  }
  loadShipmentBySortation(id: number) {
    this.isSpinning = true;
    this.sortationService.getSortationByShipmentById(id).subscribe({
      next: (sortationByShipmentRes) => {
        this.isSpinning = false;
        this.currentSortationByShipment = sortationByShipmentRes;
        this.setupItemName(this.currentSortationByShipment);
        if (this.currentSortationByShipment.shipment != null) {
          this.currentShipment = this.currentSortationByShipment.shipment ;
        }
        else {

          this.loadShipment(this.currentSortationByShipment.shipmentId);
        }
      }, 
      error: () => this.isSpinning = false
    })
  } 

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  
  async setupItemName(sortationByShipment: SortationByShipment) {

    this.loadingShipmentLineDetailsRequest = 0;
    let index = 0; 
    while (index < sortationByShipment.sortationByShipmentLines.length) {
 
      
      while(this.loadingShipmentLineDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
       
      this.setupItemNameForShipmentLine(sortationByShipment.sortationByShipmentLines[index]);
      index++;
    } 
    while(this.loadingShipmentLineDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
    // refresh the table while everything is loaded 
    this.sortationByShipmentTable.reload();    
  }

  setupItemNameForShipmentLine(sortationByShipmentLine: SortationByShipmentLine) {
     
    if (!sortationByShipmentLine.itemName  && sortationByShipmentLine.itemId != null) { 
      this.loadingShipmentLineDetailsRequest++;
      this.localCacheService.getItem(sortationByShipmentLine.itemId).subscribe({
        next: (itemRes) => {
          sortationByShipmentLine.itemName = itemRes.name
          this.loadingShipmentLineDetailsRequest--;
        }, 
        error: () => this.loadingShipmentLineDetailsRequest--
      });   
    } 
  }
  
  loadShipment(shipmentId: number) {
    this.isSpinning = true;
    this.shipmentService.getShipment(shipmentId)
    .subscribe({
      next: (shipmentRes) => {
        this.isSpinning = false;
        this.currentShipment = shipmentRes; 
      }, 
      error: () => this.isSpinning = false
    })
  }

  
  sortedWholeLine(sortationByShipmentLine: SortationByShipmentLine) {
    console.log(`start to sort the whole line for ${JSON.stringify(sortationByShipmentLine)}`);
    this.isSpinning = true;
    this.sortationService.processShipmentLineSortationById(
      sortationByShipmentLine.id!, sortationByShipmentLine.arrivedQuantity - sortationByShipmentLine.sortedQuantity)
      .subscribe({
        next: () => {
          this.isSpinning = false;
          this.loadShipmentBySortation(this.currentSortationByShipment!.id!);

        }, 
        error: () => this.isSpinning = false
      });
  }

  currentBarcodeChanged(barcode: string) {
    
    console.log(`start to sort with barcode ${barcode}`);
  }

  searchByOrder() {
    let orderNumber =  this.searchForm.controls.orderNumber.value;
    if (orderNumber = "") {
      this.messageService.error("please input the order number");
      return;
    }
    this.isSpinning = true;

  }
}
