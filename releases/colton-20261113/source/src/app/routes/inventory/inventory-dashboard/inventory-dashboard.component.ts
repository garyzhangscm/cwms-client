import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { InventorySnapshotSummary } from '../models/inventory-snapshot-summary';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';

@Component({
    selector: 'app-inventory-inventory-dashboard',
    templateUrl: './inventory-dashboard.component.html',
    standalone: false
})
export class InventoryInventoryDashboardComponent implements OnInit {
 
  
  inventorySnapshotSummaryByVelocityData : any[] = [];
  inventorySnapshotSummaryByVelocityLayout: any = {};
 
  inventorySnapshotSummaryByABCCategoryData : any[] = [];
  inventorySnapshotSummaryByABCCategoryLayout: any = {};

  
  inventorySnapshotSummaryQuantityData: any[] = [];
  inventorySnapshotSummaryQuantityLayout: any = {};

  isSummaryByVelocitySpinning = false;
  isSummaryByABCCategorySpinning = false;
  isSummaryQuantitySpinning = false;

  constructor(private http: _HttpClient, 
    private inventorySnapshotService: InventorySnapshotService) { }

  ngOnInit(): void { 

    this.setupInventorySnapshotSummaryByVelocity();
    this.setupInventorySnapshotSummaryByABCCategory();
    this.setupInventorySnapshotSummaryQuantity();
    
  }
  setupInventorySnapshotSummaryByVelocity(): void {
    this.isSummaryByVelocitySpinning = true;
 

    this.inventorySnapshotService.getInventorySnapshotSummaryByVelocity().subscribe({
      next: (inventorySnapshotSummaries) => {
        // let's get all the velocity first
        let velocities = new Set<string>();
        let inventorySnapshotBatches = new Set<string>();
        // key: batch number
        // value: complete time
        let inventorySnapshotBatchCompleteTimes = new Map();

        // key: velocity + inventory snapshot batch
        // value: quantity
        let quantityByVelocity = new Map();

        
        this.inventorySnapshotSummaryByVelocityData = [];

        inventorySnapshotSummaries.forEach(
          inventorySnapshotSummary => {
            velocities.add(inventorySnapshotSummary.groupByValue);
            inventorySnapshotBatches.add(inventorySnapshotSummary.batchNumber);
            inventorySnapshotBatchCompleteTimes.set(
                  inventorySnapshotSummary.batchNumber, formatDate(inventorySnapshotSummary.completeTime, "MM/dd", 'en-US'));
            quantityByVelocity.set(`${inventorySnapshotSummary.batchNumber}-${inventorySnapshotSummary.groupByValue}`, 
                inventorySnapshotSummary.inventoryQuantity
            );
          }
        );
        velocities.forEach(
          velocity => {
            // setup one bar for each velocity, separated by batch
            let quantities : number[] = [];
            let inventorySnapshotBatchTitles: string[] = [];

            inventorySnapshotBatches.forEach(
              inventorySnapshotBatch => {
                let quantity : number = 
                    quantityByVelocity.has(`${inventorySnapshotBatch}-${velocity}`) ?
                    quantityByVelocity.get(`${inventorySnapshotBatch}-${velocity}`) : 0;

                quantities = [
                  ...quantities, quantity];

                  // setup the bar title as INV...Number + date
                inventorySnapshotBatchTitles = [...inventorySnapshotBatchTitles, 
                  `${this.escape(inventorySnapshotBatch)}(${inventorySnapshotBatchCompleteTimes.get(inventorySnapshotBatch)})`]  
              }
            )
            this.inventorySnapshotSummaryByVelocityData = [
              ...this.inventorySnapshotSummaryByVelocityData, 
              {
                x: inventorySnapshotBatchTitles,
                y: quantities,
                name: velocity,
                type: 'bar',
              }
            ]

          }
        )


        this.isSummaryByVelocitySpinning = false;
      }, 
      error: () => this.isSummaryByVelocitySpinning = false

    })
    this.inventorySnapshotSummaryByVelocityLayout = {barmode: 'stack'};

  }
  
  setupInventorySnapshotSummaryByABCCategory(): void {
    this.isSummaryByABCCategorySpinning = true;
 

    this.inventorySnapshotService.getInventorySnapshotSummaryByABCCategory().subscribe({
      next: (inventorySnapshotSummaries) => {
        // convert the summary result to the bar view 

        // let's get all the abc category first
        let abcCategories = new Set<string>();
        let inventorySnapshotBatches = new Set<string>();
        // key: batch number
        // value: complete time
        let inventorySnapshotBatchCompleteTimes = new Map();

        // key: velocity + inventory snapshot batch
        // value: quantity
        let quantityByABCCategory = new Map();

        
        this.inventorySnapshotSummaryByABCCategoryData = [];

        inventorySnapshotSummaries.forEach(
          inventorySnapshotSummary => {
            abcCategories.add(inventorySnapshotSummary.groupByValue);
            inventorySnapshotBatches.add(inventorySnapshotSummary.batchNumber);
            inventorySnapshotBatchCompleteTimes.set(
                  inventorySnapshotSummary.batchNumber, formatDate(inventorySnapshotSummary.completeTime, "MM/dd", 'en-US'));
            quantityByABCCategory.set(`${inventorySnapshotSummary.batchNumber}-${inventorySnapshotSummary.groupByValue}`, 
                inventorySnapshotSummary.inventoryQuantity
            );
          }
        );
        abcCategories.forEach(
          abcCategory => {
            // setup one bar for each abc category, separated by batch
            let quantities : number[] = [];
            let inventorySnapshotBatchTitles: string[] = [];

            inventorySnapshotBatches.forEach(
              inventorySnapshotBatch => {
                let quantity : number = 
                    quantityByABCCategory.has(`${inventorySnapshotBatch}-${abcCategory}`) ?
                    quantityByABCCategory.get(`${inventorySnapshotBatch}-${abcCategory}`) : 0;

                quantities = [
                  ...quantities, quantity];

                  // setup the bar title as INV...Number + date
                inventorySnapshotBatchTitles = [...inventorySnapshotBatchTitles, 
                  `${this.escape(inventorySnapshotBatch)}(${inventorySnapshotBatchCompleteTimes.get(inventorySnapshotBatch)})`]  
              }
            )
            this.inventorySnapshotSummaryByABCCategoryData = [
              ...this.inventorySnapshotSummaryByABCCategoryData, 
              {
                x: inventorySnapshotBatchTitles,
                y: quantities,
                name: abcCategory,
                type: 'bar',
              }
            ]

          }
        )


        this.isSummaryByABCCategorySpinning = false;
      }, 
      error: () => this.isSummaryByABCCategorySpinning = false

    })
    this.inventorySnapshotSummaryByABCCategoryLayout = {barmode: 'stack'};

  }
  
  setupInventorySnapshotSummaryQuantity(): void {
    this.isSummaryQuantitySpinning = true;
 

    this.inventorySnapshotService.getInventorySnapshotSummaryQuantity().subscribe({
      next: (inventorySnapshotSummaries) => {
        // convert the summary result to the bar view 
 
        let quantities : number[] = [];
        let inventorySnapshotBatchTitles: string[] = [];
        
        this.inventorySnapshotSummaryQuantityData = [];

        inventorySnapshotSummaries.forEach(
          inventorySnapshotSummary => {
            
            // setup the bar title as INV...Number + date
            inventorySnapshotBatchTitles = [...inventorySnapshotBatchTitles, 
                    `${this.escape(inventorySnapshotSummary.batchNumber)}(${formatDate(inventorySnapshotSummary.completeTime, "MM/dd", 'en-US')})`];
            quantities = [...quantities, inventorySnapshotSummary.inventoryQuantity];
          }
        );


        this.inventorySnapshotSummaryQuantityData = [ 
          {
            x: inventorySnapshotBatchTitles,
            y: quantities, 
            type: 'scatter',
          }
        ] 


        this.isSummaryQuantitySpinning = false;
      }, 
      error: () => this.isSummaryQuantitySpinning = false

    })
    // this.inventorySnapshotSummaryQuantityLayout = {barmode: 'stack'};

  }


  escape(value: string) : string{
    if (value.length < 10) {
      return value;
    }
    else {
      return `${value.substring(0, 3)}...${value.substring(value.length - 5)}`;
    }
  }
}
