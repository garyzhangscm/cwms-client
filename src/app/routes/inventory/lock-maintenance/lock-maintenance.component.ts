import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryLock } from '../models/inventory-lock';
import { InventoryLockService } from '../services/inventory-lock.service';

@Component({
    selector: 'app-inventory-lock-maintenance',
    templateUrl: './lock-maintenance.component.html',
    standalone: false
})
export class InventoryLockMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentInventoryLock!: InventoryLock;
  stepIndex = 0;
  pageTitle: string;
  newInventoryLock = true;
  isSpinning = false;


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private inventoryLockService: InventoryLockService,
    private messageService: NzMessageService,
    private router: Router, 
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.inventory.lock.maintenance');

    this.currentInventoryLock = this.createEmptyInventoryLock();
  }

  createEmptyInventoryLock(): InventoryLock {
    return {

      name: "",

      description: "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      allowPick: false,
      allowShip: false,
      enabled: true,

    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.inventoryLockService.getInventoryLock(params.id)
          .subscribe(inventoryLock => {
            this.currentInventoryLock = inventoryLock;

            this.newInventoryLock = false;
          });
      }
      else {
        
        this.newInventoryLock = true;
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
    this.isSpinning = true;
    if (this.newInventoryLock) {

      this.inventoryLockService.addInventoryLock(this.currentInventoryLock)
        .subscribe(
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.isSpinning = false
                this.router.navigateByUrl(`/inventory/lock?name=${this.currentInventoryLock.name}`);
              }, 500);
            }, 
            error: () => this.isSpinning = false
          }
        );
    }
    else {

      this.inventoryLockService.changeInventoryLock(this.currentInventoryLock)
        .subscribe(
          
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.isSpinning = false
                this.router.navigateByUrl(`/inventory/lock?name=${this.currentInventoryLock.name}`);
              }, 500);
            }, 
            error: () => this.isSpinning = false
          }
        );
    }
  }

  returnToPreviousPage() {
    
    if (this.newInventoryLock) {

      this.router.navigateByUrl(`/inventory/lock`);
    }
    else {

      this.router.navigateByUrl(`/inventory/lock?name=${this.currentInventoryLock.name}`);
    }
  }

}
