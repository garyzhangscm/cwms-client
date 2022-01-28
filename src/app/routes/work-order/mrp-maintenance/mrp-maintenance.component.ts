import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { differenceInCalendarDays, getMonth, parseISO } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';
import { MasterProductionScheduleLine } from '../models/master-production-schedule-line';
import { MaterialRequirementsPlanning } from '../models/material-requirements-planning';
import { MaterialRequirementsPlanningLine } from '../models/material-requirements-planning-line';
import { ProductionLine } from '../models/production-line';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { MaterialRequirementsPlanningService } from '../services/material-requirements-planning.service';

interface FlatNode {
  expandable: boolean;
  name: string;
  key: string;
  level: number;

  
  totalRequiredQuantity: number;
  requiredQuantity: number;
  expectedInventoryOnHand: number;
  expectedReceiveQuantity: number;
  expectedOrderQuantity: number;
  expectedWorkOrderQuantity: number;
   
}
interface TreeNode {
  name: string;
  key: string;
   

  children?: TreeNode[];
}


@Component({
  selector: 'app-work-order-mrp-maintenance',
  templateUrl: './mrp-maintenance.component.html',
  styleUrls: ['./mrp-maintenance.component.less'],
})
export class WorkOrderMrpMaintenanceComponent implements OnInit {

  currentMRP?: MaterialRequirementsPlanning;
  currentMPS?: MasterProductionSchedule;
  pageTitle = "";
  isSpinning = false;
  searchForm!: FormGroup;
  availableProductionLines: ProductionLine[] = [];
  stepIndex = 0;
  cutOffDate?: Date;
  selectedProductionLines: ProductionLine[] = [];

  // data needed to build the tree view for MRP lines
  private transformer = (node: MaterialRequirementsPlanningLine, level: number): FlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.key === node.itemId?.toString()
        ? existingNode
        : {
            expandable: !!node.children && node.children.length > 0,
            name: node.item!.name,
            level,
            key: node.itemId!.toString(),
            
            totalRequiredQuantity: node.totalRequiredQuantity,
            requiredQuantity: node.requiredQuantity,
            expectedInventoryOnHand: node.expectedInventoryOnHand,
            expectedReceiveQuantity: node.expectedReceiveQuantity,
            expectedOrderQuantity: node.expectedOrderQuantity,
            expectedWorkOrderQuantity: node.expectedWorkOrderQuantity,
          };
    flatNode.name = node.item!.name;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  treeData : MaterialRequirementsPlanningLine[] = [];
  flatNodeMap = new Map<FlatNode, MaterialRequirementsPlanningLine>();
  nestedNodeMap = new Map<MaterialRequirementsPlanningLine, FlatNode>();
  selectListSelection = new SelectionModel<FlatNode>(true);
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  
  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: FlatNode): boolean => node.expandable; 
  trackBy = (_: number, node: FlatNode): string => `${node.key}-${node.name}`;

  constructor(private http: _HttpClient,
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private materialRequirementsPlanningService: MaterialRequirementsPlanningService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private warehouseService: WarehouseService,
    private activatedRoute: ActivatedRoute,  
    private messageService: NzMessageService, ) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('MRP.maintenance'));
    // initiate the search form
    this.searchForm = this.fb.group({
      mpsNumber: [null],
      cutoffDate: [null],
      productionLines: [null],
    });}


  resetForm(): void {
    this.searchForm.reset();
    this.currentMRP = undefined;
    this.currentMPS = undefined;
    this.cutOffDate = undefined;
    this.selectedProductionLines = [];

  }
  loadMPS() {
    if (this.searchForm.controls.mpsNumber.value) {
      // only load the MPS when the user input the MPS
      this.isSpinning = true;
      this.masterProductionScheduleService.getMasterProductionSchedules(
        this.searchForm.controls.mpsNumber.value
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
  saveResult() {

  }

  // setup the tree view based on the MRP lines
  setupMRPLineDisplay() {
    
    this.treeData =[ this.currentMRP!.materialRequirementsPlanningLines[0]
    ];
    console.log(`this.treeData: ${JSON.stringify(this.treeData)}`)
    this.dataSource.setData(this.treeData);
    this.treeControl.expandAll();

  }
 
  
  removeBOM(node: FlatNode) {}
  expandByBom(node: FlatNode) {}
}
