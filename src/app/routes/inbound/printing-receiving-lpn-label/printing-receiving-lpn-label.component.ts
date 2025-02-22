import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { UnitService } from '../../common/services/unit.service';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service'; 
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { InboundReceivingConfiguration } from '../models/inbound-receiving-configuration';
import { Receipt } from '../models/receipt';
import { ReceiptLine } from '../models/receipt-line';
import { InboundReceivingConfigurationService } from '../services/inbound-receiving-configuration.service';
import { ReceiptService } from '../services/receipt.service';

@Component({
    selector: 'app-inbound-printing-receiving-lpn-label',
    templateUrl: './printing-receiving-lpn-label.component.html',
    standalone: false
})
export class InboundPrintingReceivingLpnLabelComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  
  currentReceipt?: Receipt;
  startLPN: string = "";
  quantity: number = 0; 
  isSpinning = false;
  userSpecifyLPN = false;
  ignoreInventoryQuantity = false;

  standardPalletSize = 1.6;

  returnUrl = ""; 
  documentFormat = "label";
  inventoryConfiguration?: InventoryConfiguration;
  inboundReceivingConfiguration?: InboundReceivingConfiguration;
  
  // key: receipt line id
  // value: lable count
  lpnLabelCountByReceiptLines = new Map<number, number>();
  
  // key: receipt line id
  // value: quantity to be printedon label, can be null
  lpnQuantityOnLabelByReceiptLines = new Map<number, number>();
  
  // key: receipt line id
  // value: whether to ignore the lpn quantity on the label
  ignoreInventoryQuantityByReceiptLines = new Map<number, boolean>();

  @ViewChild('receiptLineTable', { static: true })
  st!: STComponent;
  
  // the item package type that will be used to calculate the 
  // quanties for receipt line. 
  // 1. if there's one defined at the receipt line, then we will use it
  // 2. otherwise we will use the default item package type of the item
  receiptLineItemPackageTypes = new Map<number, ItemPackageType | undefined>();
  
  receiptLineTableColumns: STColumn[] = [];
  setupReceiptLineTableColumns() {

    this.receiptLineTableColumns = [ 
      { title: this.i18n.fanyi("receipt.line.number"), index: 'number', width: 150 },    
      {
        title: this.i18n.fanyi("item"), width: 150, 
        render: 'itemNameColumn', 
      },
      {
        title: this.i18n.fanyi("item.description"), width: 150, 
        render: 'itemDescriptionColumn', 
      }, 
      {
        title: this.i18n.fanyi("itemPackageType"), width: 150, index: 'itemPackageType.name'  
      }, 
      { title: this.i18n.fanyi("receipt.line.expectedQuantity"), 
      
          render: 'expectedQuantityColumn',  width: 150 },     
      { title: this.i18n.fanyi("cubicMeter"), 
          render: 'cubicMeterColumn',  width: 150 },  
      { title: this.i18n.fanyi("receipt.line.receivedQuantity"),  render: 'receivedQuantityColumn',  width: 150 },    
      { title: this.i18n.fanyi("receipt.line.overReceivingQuantity"), index: 'overReceivingQuantity' , width: 150 },  
      { title: this.i18n.fanyi("receipt.line.overReceivingPercent"), index: 'overReceivingPercent' , width: 150 },         
      { title: this.i18n.fanyi("color"), index: 'color', width: 150 },  
        { title: this.i18n.fanyi("productSize"), index: 'productSize', width: 150 },  
        { title: this.i18n.fanyi("style"), index: 'style', width: 150 }, 
        { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
              index: 'inventoryAttribute1' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,  
              index: 'inventoryAttribute2' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute2Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,  
              index: 'inventoryAttribute3' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute3Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
              index: 'inventoryAttribute4' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute4Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'inventoryAttribute5' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute5Enabled == true, width: 150  
        }, 
        {
          title: this.i18n.fanyi("inventory-quantity-on-lpn"), 
          render: 'lpnQuantityOnLabelColumn', 
          width: 250,
          fixed: 'right', 
    
        },  
        {
          title: this.i18n.fanyi("label-count"), 
          render: 'lableCountColumn', 
          width: 150,
          fixed: 'right', 
    
        },  
    
    ];
  }
   
  
  
  constructor(private http: _HttpClient,  
    private receiptService: ReceiptService,
    private activatedRoute: ActivatedRoute,    
    private titleService: TitleService,
    private messageService: NzMessageService,
    private localCacheService: LocalCacheService,
    private printingService: PrintingService,
    private unitService: UnitService,
    private inventoryConfigurationService: InventoryConfigurationService,
    private inboundReceivingConfigurationService: InboundReceivingConfigurationService,
    private router: Router,  ) { 
    
    this.pageTitle = this.i18n.fanyi('pre-print-lpn-label');
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        } 
        this.setupReceiptLineTableColumns();
      } , 
      error: () =>  this.setupReceiptLineTableColumns()
    });
    
    inboundReceivingConfigurationService.getBestMatchInboundReceivingConfiguration().subscribe({
      next: (inboundReceivingConfigurationRes) => {
        if (inboundReceivingConfigurationRes) { 
          this.inboundReceivingConfiguration = inboundReceivingConfigurationRes;
          if (inboundReceivingConfigurationRes.standardPalletSize != null && 
                inboundReceivingConfigurationRes.standardPalletSize > 0) {
            this.standardPalletSize = inboundReceivingConfigurationRes.standardPalletSize;
          }

        }  
      } 
    });
 
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('pre-print-lpn-label'));
    this.activatedRoute.queryParams.subscribe(params => {
      // we may pre-print lpn label for receipt or work order
      if (params['receiptId']) {

        this.isSpinning = true;
        this.receiptService.getReceipt(params['receiptId']).subscribe(
          {
            next:(receiptRes) => { 

                this.currentReceipt = receiptRes;
              
                this.isSpinning = false; 
                this.returnUrl = `/inbound/receipt?number=${this.currentReceipt.number}` 
                this.initLPNLabelCounts(receiptRes); 
                this.initInventoryQuantityOnLPNLabels(receiptRes);
                this.loadItems(receiptRes);
            }
          }
        );
      }
    });
  } 
 

loadItems(receipt: Receipt) {
   receipt.receiptLines.forEach(
     receiptLine => this.loadItem(receiptLine)
   );
}

loadItem(receiptLine: ReceiptLine) { 
  if (receiptLine.itemId && receiptLine.item == null) {  
     
    this.localCacheService.getItem(receiptLine.itemId).subscribe(
      {
        next: (itemRes) => { 
          receiptLine.item = itemRes; 

          this.loadItemPackageType(receiptLine); 
          this.calculateReceiptLineDisplayQuantity(receiptLine);
        }
      }
    );
  }
  else if (receiptLine.item != null) {
    // console.log(`item is not null:\n${JSON.stringify(receiptLine.item)}`)
    this.loadItemPackageType(receiptLine);
    this.calculateReceiptLineDisplayQuantity(receiptLine);
  }
}

calculateReceiptLineDisplayQuantity(receiptLine: ReceiptLine) : void { 
  // let's calculate the display quantities based on the item package type of priorities
  // 1. if there's one defined at the receipt line level
  // 2. default item package type of the item
  const itemPackagetType : ItemPackageType | undefined = this.getItemPackageTypeForCalculateReceiptLineQuantity(receiptLine);
  //console.log(`item package type ${itemPackagetType?.name} will be used for line ${receiptLine.number}`);
  // see if we have the display UOM setup
  // if the display item unit of measure is setup for the item
  // then we will update the display quantity accordingly.
  // the same logic for both expected quantity and received quantity
  // 1. if the quantity can be divided by the display UOM's quantity, then display
  //    the quantity in display UOM and setup the display UOM for each quantity accordingly
  // 2. otherwise, setup teh quantity in stock UOM and use the stock UOM as the display quantity
  //    for each quantity
  if (itemPackagetType?.displayItemUnitOfMeasure) {
      //console.log(`display uom ${itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure?.name} is setup for item package type ${itemPackagetType.name}`)
      // console.log(`>> found displayItemUnitOfMeasure: ${receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure?.name}`)
      let displayItemUnitOfMeasureQuantity  = itemPackagetType?.displayItemUnitOfMeasure.quantity;
      //console.log(`> its quantity is ${displayItemUnitOfMeasureQuantity}`)
      
      // console.log(`>> with quantity ${displayItemUnitOfMeasureQuantity}`)
      //console.log(`receiptLine.expectedQuantity: ${receiptLine.expectedQuantity}, displayItemUnitOfMeasureQuantity: ${displayItemUnitOfMeasureQuantity}`)
        
      if (receiptLine.expectedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
        //console.log(`use the display item unit of measure ${itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure?.name} for display`)
        receiptLine.displayUnitOfMeasureForExpectedQuantity = itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure;
        receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity! / displayItemUnitOfMeasureQuantity!
      }
      else {
        // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
        // stock uom
        //console.log(`use the stock item unit of measure ${itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure?.name} for display`)
        
        receiptLine.displayExpectedQuantity! = receiptLine.expectedQuantity!;
        // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
        receiptLine.displayUnitOfMeasureForExpectedQuantity = itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure;
      }
        
      if (receiptLine.receivedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
        receiptLine.displayReceivedQuantity = receiptLine.receivedQuantity! / displayItemUnitOfMeasureQuantity!
        receiptLine.displayUnitOfMeasureForReceivedQuantity = itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure;
      }
      else {
        // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
        // stock uom
        receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
        // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
        receiptLine.displayUnitOfMeasureForReceivedQuantity = itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure;
      }
    }
    else {
      // there's no display UOM setup for this inventory, we will display
      // by the quantity
        receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity!;
        receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
    }  
}
changeDisplayItemUnitOfMeasureForExpectedQuantity(receiptLine: ReceiptLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

  
  // see if the inventory's quantity can be divided by the item unit of measure
  // if so, we are allowed to change the display UOM and quantity
  if (receiptLine.expectedQuantity! % itemUnitOfMeasure.quantity! == 0) {

    receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity! / itemUnitOfMeasure.quantity!;
    receiptLine.displayUnitOfMeasureForExpectedQuantity = itemUnitOfMeasure.unitOfMeasure;
  }
  else {
    this.messageService.error(`can't change the display quantity as the line's expected quantity ${ 
      receiptLine.expectedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
        }'s quantity ${  itemUnitOfMeasure.quantity}`);
  }
}

changeDisplayItemUnitOfMeasureForReceivedQuantity(receiptLine: ReceiptLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

  
  // see if the inventory's quantity can be divided by the item unit of measure
  // if so, we are allowed to change the display UOM and quantity
  if (receiptLine.receivedQuantity! % itemUnitOfMeasure.quantity! == 0) {

    receiptLine.displayReceivedQuantity = receiptLine.receivedQuantity! / itemUnitOfMeasure.quantity!;
    receiptLine.displayUnitOfMeasureForReceivedQuantity = itemUnitOfMeasure.unitOfMeasure;
  }
  else {
    this.messageService.error(`can't change the display quantity as the line's received quantity ${ 
      receiptLine.displayReceivedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
        }'s quantity ${  itemUnitOfMeasure.quantity}`);
  }
}

// setup the item package type
loadItemPackageType(receiptLine: ReceiptLine) {

  if (receiptLine.itemPackageTypeId != null && receiptLine.itemPackageType == null) {
      receiptLine.itemPackageType = receiptLine.item?.itemPackageTypes.find(
        itempackageType => itempackageType.id == receiptLine.itemPackageTypeId
      );
  }

  // we will save the item package type for the receipt line so that we can calculate and display the
  // quantity based on the right item package type
  // 1. if there's a item package type defined at the receipt line, then we will use it
  // 2. otherwise we will use the default item package type
  this.receiptLineItemPackageTypes.set(receiptLine.id!, 
    receiptLine.itemPackageType == null ? receiptLine.item?.defaultItemPackageType : receiptLine.itemPackageType);
}

calculateQuantities(receipts: Receipt[]): Receipt[] {
  receipts.forEach(receipt => {
    const existingItemIds = new Set();
    receipt.totalExpectedQuantity = 0;
    receipt.totalReceivedQuantity = 0;
    receipt.totalLineCount = receipt.receiptLines.length;

    receipt.receiptLines.forEach(receiptLine => {
      receipt.totalExpectedQuantity! += receiptLine.expectedQuantity!;
      receipt.totalReceivedQuantity! += receiptLine.receivedQuantity!;
      if (!existingItemIds.has(receiptLine.itemId)) {
        existingItemIds.add(receiptLine.itemId);
      }
    });
    receipt.totalItemCount = existingItemIds.size;
  });
  return receipts;
}
 
  return(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  validateLPNLabelCount(): boolean {

    let valid = true;
    this.lpnLabelCountByReceiptLines.forEach(
      (value, key) => {
        if (value == null || value <= 0) {
          valid = false
        }
      }
    )
    return valid;
  }
  
  validateLPNQuantityOnLabel(): boolean {

    let valid = true;
    // for each line, either we ignore the quantity
    // or the user input an valid quantity to be displayed on the label
    this.currentReceipt?.receiptLines.forEach(
      receiptLine => {
        if (this.ignoreInventoryQuantityByReceiptLines.get(receiptLine.id!) != true && 
            (this.lpnQuantityOnLabelByReceiptLines.get(receiptLine.id!) == null || this.lpnQuantityOnLabelByReceiptLines.get(receiptLine.id!)! <= 0)) {
                valid = false;
            }
      }
    )
    return valid;
  }

  printLPNLabels(event: any) {
    
    this.isSpinning = true;
    if (!this.validateLPNLabelCount()) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }
    if (!this.validateLPNQuantityOnLabel()) {
      
      this.messageService.error(this.i18n.fanyi("Quantity on the LPN Label needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }

    if (this.userSpecifyLPN) {
      this.printByUserSpecifiedLPN(event);
    }
    else {
      this.printBySystemGeneratedLPN(event);
    }
  }
  printByUserSpecifiedLPN(event: any) {
    // make sure the user specify a start LPN
    if (!this.startLPN) {
      this.messageService.error(this.i18n.fanyi("ERROR-NEW-LPN-REQUIRED"))
      this.isSpinning = false;  
      return;
    }
    this.printLPNLabelInBatch(event, this.startLPN); 

  }
  printBySystemGeneratedLPN(event: any) {

    this.printLPNLabelInBatch(event, "",);
     
  }  
  printLPNLabelInBatch(event: any, startLPN: string) {
    
     
      if (this.documentFormat === 'report') {

        this.printReceivingLPNReportInBatch(event, startLPN);
      }
      else {

        this.printReceivingLPNLabelInBatch(event, startLPN);
      } 
  }
   
  printReceivingLPNLabelInBatch(event: any, startLPN: string) {
    this.receiptService.generatePrePrintLPNReportInBatch(
      this.currentReceipt!.id!, this.lpnLabelCountByReceiptLines, 
      this.lpnQuantityOnLabelByReceiptLines, 
      this.ignoreInventoryQuantityByReceiptLines,
      startLPN,
      event.printerName )
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          // const printFileUrl
          //  = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          // console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Receiving LPN Label",
            printResult.fileName,
            ReportType.RECEIVING_LPN_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            // 1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentReceipt?.number, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      }) 
    
  }
  printReceivingLPNReportInBatch(event: any, startLPN: string) {
    /**
     * 
     * this.receiptLineService.generatePrePrintLPNReportInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount,
      1, // event.physicalCopyCount, 
      event.printerName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          // const printFileUrl
          //  = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          // console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Receiving LPN Report",
            printResult.fileName,
            ReportType.RECEIVING_LPN_REPORT,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            // 1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentReceiptLine?.receiptNumber, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
     * 
     */
    
  }
  
  previewLPNs(event: any) {
    // preview label is not support
    if (this.documentFormat === 'label') {

      this.previewLPNLabel(event);
    }
    else {
      this.previewLPNReport();
    }
  }
  
  previewLPNReport() { 
    this.isSpinning = true; 
    if (!this.validateLPNLabelCount()) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    } 
    if (!this.validateLPNQuantityOnLabel()) {
      
      this.messageService.error(this.i18n.fanyi("Quantity on the LPN Label needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }
  }
  
  
  previewLPNLabel(event: any) {
    
    this.isSpinning = true;
    if (!this.validateLPNLabelCount()) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }
    if (!this.validateLPNQuantityOnLabel()) {
      
      this.messageService.error(this.i18n.fanyi("Quantity on the LPN Label needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }

    if (this.userSpecifyLPN) {
      this.previewByUserSpecifiedLPN(event);
    }
    else {
      this.previewBySystemGeneratedLPN(event);
    }
  }
  
  previewByUserSpecifiedLPN(event: any) {
    // make sure the user specify a start LPN
    if (!this.startLPN) {
      this.messageService.error(this.i18n.fanyi("ERROR-NEW-LPN-REQUIRED"))
      this.isSpinning = false;  
      return;
    }
    this.previewLPNLabelInBatch(event, this.startLPN); 

  }
  previewBySystemGeneratedLPN(event: any) {

    this.previewLPNLabelInBatch(event, "");
     
  } 
  
  previewLPNLabelInBatch(event: any, startLPN: string) { 
    console.log(`start to preview lpn label with parameters`);
    console.log(`this.lpnLabelCountByReceiptLines.size: ${this.lpnLabelCountByReceiptLines.size}`);
    console.log(`this.lpnQuantityOnLabelByReceiptLines.size: ${this.lpnQuantityOnLabelByReceiptLines.size}`);
    console.log(`this.ignoreInventoryQuantityByReceiptLines.size: ${this.ignoreInventoryQuantityByReceiptLines.size}`); 

    this.isSpinning = true; 
    this.receiptService.generatePrePrintLPNReportInBatch(
      this.currentReceipt!.id!, this.lpnLabelCountByReceiptLines, 
      this.lpnQuantityOnLabelByReceiptLines, 
      this.ignoreInventoryQuantityByReceiptLines,
      startLPN)
      .subscribe({
        next: (printResult) => {
          
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

            
        }, 
        error: () => this.isSpinning = false
      });

  } 

  lpnLabelCountChanged(receiptLineId: number, lpnLabelCount: number) {
    this.lpnLabelCountByReceiptLines.set(receiptLineId, lpnLabelCount);
  }
  
  lpnQuantityOnLabelChanged(receiptLineId: number, lpnQuantityOnLabel: number) {
    this.lpnQuantityOnLabelByReceiptLines.set(receiptLineId, lpnQuantityOnLabel);
  }

  
  ignoreInventoryQuantityChanged(receiptLineId: number, ignoreInventoryQuantity: boolean) {
    this.ignoreInventoryQuantityByReceiptLines.set(receiptLineId, ignoreInventoryQuantity);
  }

  initLPNLabelCounts(receipt: Receipt) {
    receipt.receiptLines.forEach(
      receiptLine => this.initLPNLabelCount(receiptLine)
    )
    
    console.log(`after initLPNLabelCounts the this.lpnLabelCountByReceiptLines: ${JSON.stringify(this.lpnLabelCountByReceiptLines)}`);
    
  }

  // setup the LPN quantites on the label
  // by default, we will setup ignoreInventoryQuantity
  // for all lines
  initInventoryQuantityOnLPNLabels(receipt: Receipt) {
      receipt.receiptLines.forEach(
        receiptLine => this.initInventoryQuantityOnLPNLabel(receiptLine)
      )
  }
  
  initInventoryQuantityOnLPNLabel(receiptLine: ReceiptLine) {
      this.ignoreInventoryQuantityByReceiptLines.set(receiptLine.id!, true);
      this.lpnQuantityOnLabelByReceiptLines.set(receiptLine.id!, 0);

  }
  
  initLPNLabelCount(receiptLine: ReceiptLine) {

    // console.log(`start to estimate the LPN label count for receipt line ${receiptLine.id}`);

    if (!this.inboundReceivingConfiguration || !this.inboundReceivingConfiguration.estimatePalletCountBySize) {
      // estimate the lpn count by quantity of the receipt line and quantity of LPN item unit of measure
      this.lpnLabelCountByReceiptLines.set(receiptLine.id!, this.getLPNLabelCountsByItemPackageTypeQuantity(receiptLine));
    }
    else if (!this.inboundReceivingConfiguration.estimatePalletCountByReceiptLineCubicMeter) {
        // estimate the lpn count by size of the receipt line from LPN item unit of measure and
        // size of the standardPalletSize(this.standardPalletSize)
      this.lpnLabelCountByReceiptLines.set(receiptLine.id!, this.getLPNLabelCountsByItemPackageTypeSize(receiptLine));
    }
    else if(receiptLine.cubicMeter != null){

        // estimate the lpn count by size of the receipt line's cubic meter
        // size of the standardPalletSize(this.standardPalletSize)

      this.lpnLabelCountByReceiptLines.set(receiptLine.id!, this.getLPNLabelCountsByReceiptLineCubicMeter(receiptLine));
    }
    else {
      this.lpnLabelCountByReceiptLines.set(receiptLine.id!, this.getLPNLabelCountsByItemPackageTypeQuantity(receiptLine));

    }
  }
  standardPalletSizeChanged() {
    // refresh the label count when the standard pallet size changed, only make the change
    // when the system is configured to use the standard pallet size to calculate the label count
    console.log(`standardPalletSizeChanged: this.inboundReceivingConfiguration == null? ${this.inboundReceivingConfiguration == null}`)
    console.log(`standardPalletSizeChanged: this.inboundReceivingConfiguration.estimatePalletCountBySize? ${this.inboundReceivingConfiguration?.estimatePalletCountBySize}`)
    if (this.inboundReceivingConfiguration && this.inboundReceivingConfiguration.estimatePalletCountBySize) { 
      this.initLPNLabelCounts(this.currentReceipt!);
    }
  }
  
  getLPNLabelCountsByReceiptLineCubicMeter(receiptLine: ReceiptLine) : number {
 
    // console.log(`> estimate by receipt line cubic meter`);

    if (receiptLine.cubicMeter == null) {
      return 1;
    } 
    if (this.standardPalletSize == null || this.standardPalletSize <= 0) {
      return Math.ceil(receiptLine.cubicMeter!);
    }
    

    return Math.ceil(receiptLine.cubicMeter! / this.standardPalletSize);
  }
  getLPNLabelCountsByItemPackageTypeSize(receiptLine: ReceiptLine) : number {
 

    // console.log(`> estimate by case UOM's size `);
    // we will always calculate the size by case since it is the
    // most UOM that the inventory will be stack
    const caseUnitOfMeasure = this.getCaseUnitOfMeasure(receiptLine);

    if (caseUnitOfMeasure == null) {
      return 1;
    }
    // get the size of the LPN unit of measure
    // and convert it to the base UNIT(which we assume is inch)
    const receiptLineSizeByCaseQuantityInInch : number = 
        Math.ceil(receiptLine.expectedQuantity! / caseUnitOfMeasure.quantity!) * // get the quantity of cases
        this.unitService.convertToBaseUnit(caseUnitOfMeasure.length!, caseUnitOfMeasure.lengthUnit) *  // multiple by the case's size
        this.unitService.convertToBaseUnit(caseUnitOfMeasure.width!, caseUnitOfMeasure.widthUnit) *
        this.unitService.convertToBaseUnit(caseUnitOfMeasure.height!, caseUnitOfMeasure.heightUnit); 
    
    return Math.ceil(receiptLineSizeByCaseQuantityInInch / this.standardPalletSize);
  }
  
  getLPNLabelCountsByItemPackageTypeQuantity(receiptLine: ReceiptLine) : number {


    // console.log(`> estimate by LPN UOM's quantity `);
    const lpnUnitOfMeasure = this.getLPNUnitOfMeasure(receiptLine);

    if (lpnUnitOfMeasure == null) {
      return 1;
    }
    return Math.ceil(receiptLine.expectedQuantity! / lpnUnitOfMeasure.quantity!);
  }
  getLPNUnitOfMeasure(receiptLine: ReceiptLine) : ItemUnitOfMeasure | undefined {

    const itemPackagetType : ItemPackageType | undefined = this.getItemPackageTypeForCalculateReceiptLineQuantity(receiptLine);
    if (itemPackagetType == null) {
      // not able to find the item package type, let's return 1 by default
      return undefined;
    }
    // let's get the item unit of measrue for the LPN level
    const lpnUnitOfMeasures = itemPackagetType.itemUnitOfMeasures.filter(
      itemUnitOfMeasure => itemUnitOfMeasure.trackingLpn
    ).sort((first, second) => first.quantity!  - second.quantity!);
    if (lpnUnitOfMeasures == null || lpnUnitOfMeasures.length == 0) {
      return undefined;
    }
    return lpnUnitOfMeasures[0];
  }
  
  getCaseUnitOfMeasure(receiptLine: ReceiptLine) : ItemUnitOfMeasure | undefined {

    const itemPackagetType : ItemPackageType | undefined = this.getItemPackageTypeForCalculateReceiptLineQuantity(receiptLine);
    if (itemPackagetType == null) {
      // not able to find the item package type, let's return 1 by default
      return undefined;
    }
    // let's get the item unit of measrue for the LPN level
    const caseUnitOfMeasures = itemPackagetType.itemUnitOfMeasures.filter(
      itemUnitOfMeasure => itemUnitOfMeasure.caseFlag
    ).sort((first, second) => first.quantity!  - second.quantity!);
    if (caseUnitOfMeasures == null || caseUnitOfMeasures.length == 0) {
      return undefined;
    }
    return caseUnitOfMeasures[0];
  }
 

  getItemPackageTypeForCalculateReceiptLineQuantity(receiptLine: ReceiptLine) : ItemPackageType | undefined {
    
    return (this.receiptLineItemPackageTypes.has(receiptLine.id!) && this.receiptLineItemPackageTypes.get(receiptLine.id!) != null) ?
        this.receiptLineItemPackageTypes.get(receiptLine.id!) : 
          (receiptLine.itemPackageType == null ? 
                receiptLine.item?.defaultItemPackageType :
                receiptLine.itemPackageType);

  }
}
