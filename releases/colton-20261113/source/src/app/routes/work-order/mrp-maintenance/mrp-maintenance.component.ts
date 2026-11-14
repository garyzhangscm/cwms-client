 
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { differenceInCalendarDays, getMonth, parseISO } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree'; 
 
import { ItemService } from '../../inventory/services/item.service';
import { LocalCacheService } from '../../util/services/local-cache.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { MasterProductionSchedule } from '../models/master-production-schedule';
import { MasterProductionScheduleLine } from '../models/master-production-schedule-line';
import { MaterialRequirementsPlanning } from '../models/material-requirements-planning';
import { MaterialRequirementsPlanningLine } from '../models/material-requirements-planning-line';
import { ProductionLine } from '../models/production-line';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { MaterialRequirementsPlanningService } from '../services/material-requirements-planning.service';
 

@Component({
    selector: 'app-work-order-mrp-maintenance',
    templateUrl: './mrp-maintenance.component.html',
    styleUrls: ['./mrp-maintenance.component.less'],
    standalone: false
})
export class WorkOrderMrpMaintenanceComponent implements OnInit {

  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentMRP?: MaterialRequirementsPlanning;
  currentMPS?: MasterProductionSchedule;
  pageTitle = "MRP.maintenance";
  isSpinning = false;
  searchForm!: UntypedFormGroup;
  
  availableProductionLines: ProductionLine[] = [];
  stepIndex = 0;
  cutOffDate?: Date;
  selectedProductionLines: ProductionLine[] = [];

  // modal for choosing BOM
  selectedBOM?: BillOfMaterial;
  listOfBOMs: BillOfMaterial[] = [];
  chooseBOMModal!: NzModalRef;

  // data needed to build the tree view for MRP lines
  itemTreeNodes: NzTreeNodeOptions[] = [];

  
  addMRPForm!: UntypedFormGroup;
  addMRPModal!: NzModalRef;

  constructor(private http: _HttpClient,
    private fb: UntypedFormBuilder,
    private titleService: TitleService,
    private materialRequirementsPlanningService: MaterialRequirementsPlanningService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private router: Router,
    private itemService: ItemService,
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private activatedRoute: ActivatedRoute,  
    private billOfMaterialService: BillOfMaterialService,
    private localCacheService: LocalCacheService,
    private messageService: NzMessageService, ) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('MRP.maintenance'));
    // initiate the search form
    this.searchForm = this.fb.group({
      mpsNumber: [null],
      cutoffDate: [null],
      productionLines: [null],
    });
  }


  resetForm(): void {
    this.searchForm.reset();
    this.currentMRP = undefined;
    this.currentMPS = undefined;
    this.cutOffDate = undefined;
    this.selectedProductionLines = [];

  }
  loadMPS() {
    if (this.searchForm.value.mpsNumber) {
      // only load the MPS when the user input the MPS
      this.isSpinning = true;
      this.masterProductionScheduleService.getMasterProductionSchedules(
        this.searchForm.value.mpsNumber
      ).subscribe({
        next: (mps) => {

          // we should only at maximun one MPS returned per number
          if (mps.length == 0) {
            this.messageService.error(this.i18n.fanyi("incorrect-mps-number"))
          }
          this.currentMPS = mps[0];
          this.initiatePorductionLines(this.currentMPS);
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      })
    } 
  }
  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
    if (this.stepIndex == 1) {
      // setup empty MRP from the MPS and selected date
      this.initiateMRP();
    }
    else if (this.stepIndex == 2) {
      // convert from the tree structure into table structure
      // so that we can display in the table 
      // and save in the server
      this.flattenMRPLines();
    }

  }

  readyForNextStep(): boolean {
    if (this.stepIndex === 0) {
      
      // in first step, we will allow the user to continue only when we got
      // the MPS and the cutoff date
      return this.currentMPS != null && this.cutOffDate != null
      && this.selectedProductionLines.length > 0 &&
      this.getMRPRequiredQuantity(this.currentMPS!, this.selectedProductionLines, this.cutOffDate!) > 0;
    }
    return true;
  }

  getTotalDailyPlannedQuantity(date: Date): number { 
    let totalQuantity = 0;
    
    this.currentMPS!.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => this.selectedProductionLines.some(
        selectedProductionLine => selectedProductionLine.id! == masterProductionScheduleLine.productionLine.id!
      )
    )
    .forEach(
      masterProductionScheduleLine => totalQuantity += this.getDailyPlannedQuantity(masterProductionScheduleLine, date)
    )
    return totalQuantity;
  }
  
  getDailyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => 
          differenceInCalendarDays(
            parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10)) , date) == 0
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }

  
  getMonthlyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => getMonth(masterProductionScheduleLineDate.plannedDate) === getMonth(date)
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }
  getTotalMonthlyPlannedQuantity(date: Date): number {
    let totalQuantity = 0;
    this.currentMPS!.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => this.selectedProductionLines.some(
        selectedProductionLine => selectedProductionLine.id! == masterProductionScheduleLine.productionLine.id!
      )
    ).forEach(
      masterProductionScheduleLine => totalQuantity += this.getMonthlyPlannedQuantity(masterProductionScheduleLine, date)
    )
    return totalQuantity;
  }
  

  initiatePorductionLines(mps: MasterProductionSchedule) { 
      this.availableProductionLines = mps.masterProductionScheduleLines.map(
            mpsLine => mpsLine.productionLine
      );
      this.selectedProductionLines = this.availableProductionLines; 
      
  } 
  selectedProductionLineChanged() {
    // after the user change the selcted production line, 
    // we will refresh the display

  }
  getMPSLinesBySelectedProductionLine() {
    return this.currentMPS!.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => this.selectedProductionLines.some(
        selectedProductionLine => selectedProductionLine.id! == masterProductionScheduleLine.productionLine.id!
      )
    )
  }
   
  initiateMRP() {
    this.currentMRP = {
      
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      number: "",
      description: "",      
      productionLines: this.selectedProductionLines,
      itemId: this.currentMPS!.itemId!,
      item: this.currentMPS!.item,
      totalRequiredQuantity: this.getMRPRequiredQuantity(this.currentMPS!, this.selectedProductionLines, this.cutOffDate!),
      // MPS line on the production line
      masterProductionSchedule: this.currentMPS!,
      cutoffDate: this.cutOffDate!,
      materialRequirementsPlanningLines: []
    }
    this.currentMRP.materialRequirementsPlanningLines = [this.initiageMRPTopItemLine(this.currentMRP)];
    this.setupMRPLineDisplay();
  }

  // setup the top level item for the MRP(top most item) so
  // we can future expand by BOM
  initiageMRPTopItemLine(mrp: MaterialRequirementsPlanning) : MaterialRequirementsPlanningLine{

    return {
      
      warehouseId: mrp.warehouseId,

      itemId: mrp.itemId,
      item: mrp.item, 
      children: [],

      totalRequiredQuantity: mrp.totalRequiredQuantity,
      requiredQuantity: mrp.totalRequiredQuantity,
      expectedInventoryOnHand: 0,
      expectedReceiveQuantity: 0,
      expectedOrderQuantity: 0,
      expectedWorkOrderQuantity: 0,
      level: 0,
      sequence: 0,
    }

  }
  getSelectedProductionLineNames() {
    return this.selectedProductionLines.map(
      productionLine => productionLine.name
    )
  }
  getMRPRequiredQuantity(mps: MasterProductionSchedule, productionLines: ProductionLine[], cutOffDate: Date): number {
    let requiredQuantity = 0;

    mps.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => productionLines.some(
        productionLine => productionLine.id! == masterProductionScheduleLine.productionLine.id!
      )
    ).forEach(
      masterProductionScheduleLine=> {
        masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
          masterProductionScheduleLineDate => {

            //  only calculate the planned date that no later than the cutoff date
            if (differenceInCalendarDays(
                  parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10)) , cutOffDate) <= 0) {
              requiredQuantity = requiredQuantity +  masterProductionScheduleLineDate.plannedQuantity;
            }
          }
            
        ) 
      }
    )
    return requiredQuantity;
  }
  saveResult(
    tplAddMRPModalTitle: TemplateRef<{}>,
    tplAddMRPModalContent: TemplateRef<{}>) 
  {
    
    this.addMRPForm = this.fb.group({
      mrpNumber: [null],
      description: [null], 
    });
      
    // show the model
    this.addMRPModal = this.modalService.create({
      nzTitle: tplAddMRPModalTitle,
      nzContent: tplAddMRPModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.chooseBOMModal.destroy(); 
      },
      nzOnOk: () => {
        if (this.addMRPForm.value.mrpNumber == null) {
          this.messageService.error(this.i18n.fanyi('mrp-number-is-required'))
          return false;
        }
        this.currentMRP!.number = this.addMRPForm.value.mrpNumber;
        this.currentMRP!.description = this.addMRPForm.value.description;
        this.saveMRP();
        return true;
      },
      nzWidth: 1000,
    });

  }
  saveMRP() {
    this.isSpinning = true;
    this.materialRequirementsPlanningService.addMRP(this.currentMRP!).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/mrp?number=${this.currentMRP!.number}`);
        }, 500);
      },
      error: () => this.isSpinning = false
    })
  }

  // get the top most item from the current MRP. This is the final
  // finish goods and should be the same as the item
  getTopMostItemMRPLine() : MaterialRequirementsPlanningLine | undefined{
    return this.currentMRP!.materialRequirementsPlanningLines.find(
      mrpLine => mrpLine.parentMRPLineId == null
    );
  }
  // setup the tree view based on the MRP lines
  setupMRPLineDisplay() {
    const topMostMRPLine = this.getTopMostItemMRPLine()!;
    this.itemTreeNodes = [{
      title: topMostMRPLine.item!.name,      
      totalRequiredQuantity: topMostMRPLine.totalRequiredQuantity,
      requiredQuantity: topMostMRPLine.requiredQuantity,
      expectedInventoryOnHand: topMostMRPLine.expectedInventoryOnHand,
      expectedReceiveQuantity: topMostMRPLine.expectedReceiveQuantity,
      expectedOrderQuantity: topMostMRPLine.expectedOrderQuantity,
      expectedWorkOrderQuantity: topMostMRPLine.expectedWorkOrderQuantity,
      bom: topMostMRPLine.billOfMaterial,
      key: `${topMostMRPLine.level!.toString()  }-${ 
        topMostMRPLine.sequence!.toString()}`,
      children: this.getItemTreeNodeChildren(topMostMRPLine),
      expanded: true
    }];
     

  }
  getItemTreeNodeChildren(mrpLine: MaterialRequirementsPlanningLine): NzTreeNodeOptions[] {
    if (mrpLine.children == null || mrpLine.children.length == 0) {
      return [];
    }
    return mrpLine.children.map(
      childMRPLine => {    
        let nzTreeNodeOption: NzTreeNodeOptions =  {    
          title: childMRPLine.item!.name,
          totalRequiredQuantity: childMRPLine.totalRequiredQuantity,
          requiredQuantity: childMRPLine.requiredQuantity,
          expectedInventoryOnHand: childMRPLine.expectedInventoryOnHand,
          expectedReceiveQuantity: childMRPLine.expectedReceiveQuantity,
          expectedOrderQuantity: childMRPLine.expectedOrderQuantity,
          expectedWorkOrderQuantity: childMRPLine.expectedWorkOrderQuantity,
          bom: childMRPLine.billOfMaterial,
          key: `${childMRPLine.level!.toString()  }-${ 
            childMRPLine.sequence!.toString()}`,
          children: this.getItemTreeNodeChildren(childMRPLine)
        } 
        return nzTreeNodeOption;
      } 
    );
  }
 
  @ViewChild('bomTable', { static: true })
  bomTable!: STComponent;
  bomColumns: STColumn[] = [
    
    { title: this.i18n.fanyi("id"), index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi("bill-of-material.number"), index: 'number',   width: 100}, 
    { title: this.i18n.fanyi("item"), index: 'item.name',   width: 100}, 
    { title: this.i18n.fanyi("item.description"), index: 'item.description',   width: 100}, 
    { title: this.i18n.fanyi("bill-of-material.expectedQuantity"), index: 'expectedQuantity',   width: 100},  
   
  ];

  findMatchedMRPFromTreeNode(node: NzTreeNodeOptions, mrpLine: MaterialRequirementsPlanningLine) : MaterialRequirementsPlanningLine | undefined {

    // check if the passed in MRP line matched with the tree node.
    // if not, we will check if we can find the MRP line from the current line's children
    if (node.key == `${mrpLine.level!.toString()}-${mrpLine.sequence!.toString()}`) {
        return mrpLine;
    }
    else if (mrpLine.children == null || mrpLine.children.length == 0){

      return undefined;
    }
    else {
      let matchedMRPLine: MaterialRequirementsPlanningLine | undefined = undefined;
      for(let childMRPLine of mrpLine.children) {
        matchedMRPLine = this.findMatchedMRPFromTreeNode(node, childMRPLine);
        if (matchedMRPLine != null) {
          break;
        }

     }
     return matchedMRPLine;

    }
  }
 
  flattenMRPLines() {
    const topMostMRPLine = this.getTopMostItemMRPLine();
    if (topMostMRPLine != null) {
      // first we will clear all the lines except the top most line
      this.currentMRP!.materialRequirementsPlanningLines = [
        topMostMRPLine, 
        ...this.getAllChildrenMRPLine(topMostMRPLine)
      ];


    }
  } 

  getAllChildrenMRPLine(mrpLine: MaterialRequirementsPlanningLine) : MaterialRequirementsPlanningLine[] {
    if (mrpLine.children == null || mrpLine.children.length == 0) {
      return [];
    }
    else {
      // add the level 1 children first, then we will recusively add the descendant 
      let allChildrenMRPLine: MaterialRequirementsPlanningLine[] = mrpLine.children;

      mrpLine.children.forEach(
        childMRPLine => allChildrenMRPLine = [
          ...allChildrenMRPLine,
          ...this.getAllChildrenMRPLine(childMRPLine)
        ]
      )

      return allChildrenMRPLine;
    }
  }
  openExpandByBomModal(
    node: NzTreeNodeOptions,
    tplExpandByBOMModalTitle: TemplateRef<{}>,
    tplExpandByBOMModalContent: TemplateRef<{}>,
  ): void {
    
    // Please note this.currentMRP!.materialRequirementsPlanningLines[0] is the top most item of the 
    // MRP, which is the final finish good from the MPS
    let mrpLine = this.findMatchedMRPFromTreeNode(node, this.getTopMostItemMRPLine()!);
    
    if (mrpLine != null) {

      this.billOfMaterialService.findMatchedBillOfMaterialByItemName(mrpLine.item!.name).subscribe(
        {
          next:(bomRes) => {
            if (bomRes.length > 0) {
              // we found matched BOM, let's show the modal for the user to choose one
  
              this.listOfBOMs = bomRes;
              this.selectedBOM = undefined;
              // show the model
              this.chooseBOMModal = this.modalService.create({
                nzTitle: tplExpandByBOMModalTitle,
                nzContent: tplExpandByBOMModalContent,
                nzOkText: this.i18n.fanyi('confirm'),
                nzCancelText: this.i18n.fanyi('cancel'),
                nzMaskClosable: false,
                nzOnCancel: () => {
                  this.chooseBOMModal.destroy(); 
                },
                nzOnOk: () => {
                  if (this.selectedBOM) {
                    this.expandByBom(node, this.selectedBOM);
                    
  
                  }
                },
                nzWidth: 1000,
              });
            }
            else {
              // no matched bom found
              this.messageService.error(this.i18n.fanyi('no-matched-bom-found'))
            }
  
          }
              
        }
      )
    }

  } 
  
  mrpNumberOnBlur(event: Event): void { 
    this.addMRPForm!.value.mrpNumber.setValue((event.target as HTMLInputElement).value); 
  }

  bomTableChanged(ret: STChange): void {
    console.log('change', ret);
    if (ret.type === 'radio') {
      this.selectedBOM = ret.radio;
    }
  }
  removeBOM(node: NzTreeNodeOptions) {

    let mrpLine = this.findMatchedMRPFromTreeNode(node, this.getTopMostItemMRPLine()!);
    if (mrpLine != null) {
      mrpLine.children = [];
      mrpLine.billOfMaterial = undefined;
      this.setupMRPLineDisplay();
    }
  }
  expandByBom(node: NzTreeNodeOptions, bom?: BillOfMaterial) {

    
    // expand the MRP line by matched BOM
    if ( bom == null) {
      return;
    }

    let mrpLine = this.findMatchedMRPFromTreeNode(node, this.getTopMostItemMRPLine()!);

    if (mrpLine == null) {
      return
    }
    // setup the bom on the MRP line
    mrpLine.billOfMaterial = bom;
    // clear the old expansion if there's any

    mrpLine.children = [];

    bom.billOfMaterialLines.forEach(
      bomLine =>   
          mrpLine!.children.push(
            { 
              warehouseId: this.warehouseService.getCurrentWarehouse().id,

              itemId: bomLine.itemId,
              item: bomLine.item,
              parentMRPLineId: mrpLine!.id, 

              children: [],

              totalRequiredQuantity: mrpLine!.requiredQuantity * bomLine.expectedQuantity! / bom.expectedQuantity!,
              requiredQuantity: mrpLine!.requiredQuantity * bomLine.expectedQuantity! / bom.expectedQuantity!,
              expectedInventoryOnHand: 0,
              expectedReceiveQuantity: 0,
              expectedOrderQuantity: 0,
              expectedWorkOrderQuantity: 0,
              level: mrpLine!.level! + 1,
              sequence: mrpLine!.children.length

            }
          )
    )
    
     
    this.setupMRPLineDisplay(); 
 

    // for each newly added line, we may need to setup the item if we haven't done so,
    // so that we can further expand it
    mrpLine.children.filter(
      childMRPLine => childMRPLine.item == null && childMRPLine.itemId != null
    ).forEach(
      childMRPLine => {
        this.localCacheService.getItem(childMRPLine.itemId!).subscribe(
          {
            next: (itemRes) => childMRPLine.item = itemRes
          }
        )
      }
    )

  } 
}
