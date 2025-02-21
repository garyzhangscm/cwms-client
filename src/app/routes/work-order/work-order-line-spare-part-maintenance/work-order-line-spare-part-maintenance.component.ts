import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { newItemUOMQuantityValidator } from '../../directives/newItemUOMQuantityValidator';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderLine } from '../models/work-order-line';
import { WorkOrderLineSparePart } from '../models/work-order-line-spare-part';
import { WorkOrderLineSparePartDetail } from '../models/work-order-line-spare-part-detail';
import { WorkOrderLineSparePartService } from '../services/work-order-line-spare-part.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-work-order-line-spare-part-maintenance',
    templateUrl: './work-order-line-spare-part-maintenance.component.html',
    standalone: false
})
export class WorkOrderWorkOrderLineSparePartMaintenanceComponent implements OnInit {

  currentWorkOrderLine?: WorkOrderLine;
  isSpinning = false;
  stepIndex = 0;

  
  sparePartDetailExpandSet = new Set<number>();
  mapOfRemovableSparePartDetails: { [key: number]: boolean } = {};

  
  availableInventoryStatuses: InventoryStatus[] = [];

  sparePartDetailForm!: UntypedFormGroup;
  sparePartDetailModal!: NzModalRef; 

  currentSparePart?: WorkOrderLineSparePart;
  pageTitle = "";

  constructor(
    private fb: UntypedFormBuilder, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private workOrderService: WorkOrderService,
    private router: Router,
    private itemService: ItemService,
    private activatedRoute: ActivatedRoute, 
    private inventoryStatusService: InventoryStatusService,
    private modalService: NzModalService,) { }

  ngOnInit(): void { 
    
    this.titleService.setTitle(this.i18n.fanyi('spare-part-maintenance'));
    this.pageTitle = this.i18n.fanyi('spare-part-maintenance');

    this.activatedRoute.queryParams.subscribe(params => {
      if (!params['id']) {
        this.messageService.error("Error: Work Order Line is not passed in");
        
        this.isSpinning = true;
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/work-order`);
        }, 500);
      }
      
      this.isSpinning = true;
      this.workOrderService.getWorkOrderLine(params['id']).subscribe({
        next: (workOrderLine) => {
          this.currentWorkOrderLine = workOrderLine;
          this.isSpinning = false;
          if (!this.currentWorkOrderLine) {
            this.messageService.error(`Error: can't find Work Order Line by id ${params['id']}`);
            
            this.isSpinning = true;
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/work-order/work-order`);
            }, 500);

          }
        }
      })
    })

    this.inventoryStatusService.loadInventoryStatuses().subscribe({
      next: (inventoryStatusRes) => this.availableInventoryStatuses = inventoryStatusRes
    })
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }
  
  onSparePartExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.sparePartDetailExpandSet.add(id);
    } else {
      this.sparePartDetailExpandSet.delete(id);
    }
  }

  openAddingSparePartDetailModal(
    workOrderLineSparePart: WorkOrderLineSparePart,
    tplSparePartDetailModalTitle: TemplateRef<{}>,
    tplSparePartDetailModalContent: TemplateRef<{}>,
    tplSparePartDetailModalFooter: TemplateRef<{}>,
  ): void {
    this.currentSparePart = workOrderLineSparePart;
    this.createSparePartDetailForm(); 
 

    // Load the location
    this.sparePartDetailModal = this.modalService.create({
      nzTitle: tplSparePartDetailModalTitle,
      nzContent: tplSparePartDetailModalContent,
      nzFooter: tplSparePartDetailModalFooter,
      nzWidth: 1000,
    });
  }
  

  createSparePartDetailForm(): void {
    this.sparePartDetailForm = this.fb.group({
      name: new UntypedFormControl({ value: this.currentSparePart!.name, disabled: true }),

      itemName: [null, Validators.required],
      inventoryStatus: [null, Validators.required],
      quantity: [null, Validators.required],
    });
  }
  
  processItemQueryResult(selectedItemName: any): void { 
    this.sparePartDetailForm.value.itemName.setValue(selectedItemName);
  }

  
  closeSparePartDetailModal(): void { 
    this.sparePartDetailModal.destroy();
  }
  confirmSparePartDetail(): void { 

    console.log(`confirmSparePartDetail`);
    console.log(`this.sparePartDetailForm.valid: ${this.sparePartDetailForm.valid}`)
    if (this.sparePartDetailForm.valid) {

      this.addSparePartDetail(
        this.currentSparePart!,
        this.sparePartDetailForm.value.itemName.value,
        this.sparePartDetailForm.value.inventoryStatus.value,
        this.sparePartDetailForm.value.quantity.value,
      );

      this.sparePartDetailModal.destroy();
    }  
  }

  addSparePartDetail(
    workOrderLineSparePart: WorkOrderLineSparePart,
    itemName: string,
    inventoryStatusId: number,
    quantity: number,
  ): void {
    let matchedInventoryStatus : InventoryStatus | undefined =
      this.availableInventoryStatuses
        .find(inventoryStatus => inventoryStatus.id === inventoryStatusId);

    if (itemName != null && itemName.length > 0 && matchedInventoryStatus != null) {

      this.itemService.getItems(itemName).subscribe({
        next: (itemRes) => {
          // we should only get one item per name
          itemRes.forEach(
            item => {
              workOrderLineSparePart.workOrderLineSparePartDetails = [
                ...workOrderLineSparePart.workOrderLineSparePartDetails,
                { 
                  itemId: item.id!,
                  item: item,
                  inventoryStatusId: inventoryStatusId, 
                  inventoryStatus: matchedInventoryStatus,                  
                  
                  quantity: quantity,
                  openQuantity: quantity,
                  inprocessQuantity: 0,
                },
              ];

            }
          )
        }, 
      })
    }
    
  }

  
  removeSparePart(sparePartIndex: number): void {
    if (this.currentWorkOrderLine!.workOrderLineSpareParts!.length > sparePartIndex) {
      this.currentWorkOrderLine!.workOrderLineSpareParts = this.currentWorkOrderLine!.workOrderLineSpareParts!.filter(
        (element, index) => index !== sparePartIndex,
      );
    }
  }
  removeSparePartDetail(workOrderLineSparePart: WorkOrderLineSparePart, removedWorkOrderLineSparePartDetail: WorkOrderLineSparePartDetail): void {
    workOrderLineSparePart.workOrderLineSparePartDetails = workOrderLineSparePart.workOrderLineSparePartDetails!.filter(
      workOrderLineSparePartDetail => workOrderLineSparePartDetail.itemId !== removedWorkOrderLineSparePartDetail.itemId,
    );
  }
  
  addSparePart(): void {
    this.currentWorkOrderLine!.workOrderLineSpareParts = [
      ...this.currentWorkOrderLine!.workOrderLineSpareParts!,
      {
        id: undefined,
        name: "",
        description: "",
        quantity: 1,
        inprocessQuantity: 0,
        workOrderLineSparePartDetails: [],
      },
    ];
  }

  
  confirmSpareParts(): void { 
 
    console.log(`start to confirm spare parts`)
    console.log(`========         this.currentWorkOrderLine   ========\n ${JSON.stringify(this.currentWorkOrderLine?.workOrderLineSpareParts)}`)
      this.isSpinning = true;
      this.workOrderService.changeSpareParts(this.currentWorkOrderLine!).subscribe({
        next: (workOrderLine) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/work-order?number=${workOrderLine.workOrderNumber}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
       
  }
  

}
