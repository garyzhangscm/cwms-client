import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { InventorySnapshotSummary } from '../models/inventory-snapshot-summary';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';

@Component({
  selector: 'app-inventory-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
})
export class InventoryInventoryDashboardComponent implements OnInit {
 
  
  inventorySnapshotSummaryByVelocityData : any[] = [];
  inventorySnapshotSummaryByVelocityLayout: any = {};
 
  inventorySnapshotSummaryByABCCategoryData : any[] = [];
  inventorySnapshotSummaryByABCCategoryLayout: any = {};

  isSummaryByVelocitySpinning = false;
  isSummaryByABCCategorySpinning = false;

  constructor(private http: _HttpClient, 
    private inventorySnapshotService: InventorySnapshotService) { }

  ngOnInit(): void { 

    this.setupInventorySnapshotSummaryByVelocity();
    
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
            inventorySnapshotBatchCompleteTimes.set(inventorySnapshotSummary.batchNumber, formatDate(inventorySnapshotSummary.completeTime, "YYYY-MM-DD", 'en-US'));
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

                inventorySnapshotBatchTitles = [...inventorySnapshotBatchTitles, 
                  `${inventorySnapshotBatch}(${inventorySnapshotBatchCompleteTimes.get(inventorySnapshotBatch)})`]  
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

}
