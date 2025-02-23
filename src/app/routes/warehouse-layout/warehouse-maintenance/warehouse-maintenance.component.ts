 import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService } from '@delon/theme'; 

import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';

@Component({
    selector: 'app-warehouse-layout-warehouse-maintenance',
    templateUrl: './warehouse-maintenance.component.html',
    standalone: false
})
export class WarehouseLayoutWarehouseMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  warehouseForm!: UntypedFormGroup;
  isSpinning = false;
  warehouseAddress?: google.maps.places.PlaceResult;
  addressLine1 = "";
  addressLine2? = "";
  addressCity = "";
  addressState = "";
  addressPostcode = "";
  addressCountry = "";
  addressCounty? = "";
  

  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService, 
    private titleService: TitleService,
  ) {
    titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.header.title'));
    this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.header.title');
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id']) {

      this.warehouseForm = this.fb.group({
        warehouseId: new UntypedFormControl({ value: '', disabled: true }),
        name: new UntypedFormControl('', Validators.required),
        size: ['', Validators.required],
        contactorFirstname: [null],
        contactorLastname: [null],
        addressPhone: [null],
        address: [null],
      });
    }
    else {
      
      this.warehouseForm = this.fb.group({
        warehouseId: new UntypedFormControl({ value: '', disabled: true }),
        name: new UntypedFormControl('', Validators.required),
        size: ['', Validators.required],
        contactorFirstname: [null],
        contactorLastname: [null],
        addressPhone: [null],
        address: ['', Validators.required],
      });
    }
    this.addressLine1 = "";
    this.addressLine2 = "";
    this.addressCity = "";
    this.addressState = "";
    this.addressPostcode = "";
    this.addressCountry = "";
    this.addressCounty = "";

    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding / changing a warehouse
      // and we already fill in all the information. Let's
      // load the changed warehouse from session storage
      let warehouseLoaded = false;
      if (params['inprocess'] === 'true') {
        warehouseLoaded = this.loadWarehouseFromSessionStorage();
      }

      // load from web server
      if (!warehouseLoaded) {
        this.loadWarehouseFromServer(this.activatedRoute.snapshot.params['id']);
      }

      // setup page title
      // New: when we create a new warehouse
      // Modify: When we modify a existing warehouse
      this.setupPageTitle();
    });
  }

  loadWarehouseFromSessionStorage(): boolean {
    const warehouse = JSON.parse(sessionStorage.getItem('warehouse-maintenance.warehouse')!);
    if (warehouse.name === undefined) {
      return false;
    }

    this.warehouseForm.value.warehouseId.setValue(warehouse.id);
    this.warehouseForm.patchValue(warehouse);
    this.loadCurrentAddress(warehouse);

    return true;
  }

  loadWarehouseFromServer(warehouseId: string): void {
    if (warehouseId) {
      this.warehouseService.getWarehouse(+warehouseId).subscribe((warehouse: Warehouse) => {
        this.warehouseForm.value.warehouseId.setValue(warehouseId);
        this.warehouseForm.patchValue(warehouse);
        this.loadCurrentAddress(warehouse);
      });
    }
  }
  loadCurrentAddress(warehouse: Warehouse) {
    this.addressLine1 = warehouse.addressLine1;
    this.addressLine2 = warehouse.addressLine2;
    this.addressCity = warehouse.addressCity;
    this.addressState = warehouse.addressState;
    this.addressPostcode = warehouse.addressPostcode;
    this.addressCountry = warehouse.addressCountry;
    this.addressCounty = warehouse.addressCounty;
    
  }

  setupPageTitle(): void {
    if (this.warehouseForm.value.warehouseId.value) {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.modify.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.modify.header.title');
    } else {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.add.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.add.header.title');
    }
  }
  goToConfirmPage(): void {
    // for a new warehouse, warehouse address is required 
    if (this.warehouseForm.valid) {
      const warehouse: Warehouse = this.warehouseForm.value;
      warehouse.id = this.warehouseForm.value.warehouseId.value; 
      warehouse.addressLine1 = this.addressLine1;
      warehouse.addressLine2 = this.addressLine2;
      warehouse.addressCity = this.addressCity;
      warehouse.addressState = this.addressState;
      warehouse.addressPostcode = this.addressPostcode;
      warehouse.addressCountry = this.addressCountry;
      warehouse.addressCounty = this.addressCounty;

      if (warehouse.id == null && this.warehouseAddress == null)  {
        // make sure the warehouseAddress is not null for a new warehouse
        // clear the address control and show the error
        this.warehouseForm.value.address.reset();
        this.displayFormError(this.warehouseForm);
        
        return;
      }
      if (this.warehouseAddress != null) {

        this.warehouseAddress!.address_components!.forEach(
          addressComponent => {
            if (addressComponent.types[0] === 'street_number') {
                warehouse.addressLine1 = `${addressComponent.long_name} ${warehouse.addressLine1}`;
            }
            else if  (addressComponent.types[0] === 'route') {
              warehouse.addressLine1 = `${warehouse.addressLine1} ${addressComponent.long_name}`;
            }
            else if  (addressComponent.types[0] === 'locality') {
              warehouse.addressCity = `${addressComponent.long_name}`;
            }
            else if  (addressComponent.types[0] === 'administrative_area_level_2') {
              warehouse.addressCounty = `${addressComponent.long_name}`;
            }
            else if  (addressComponent.types[0] === 'administrative_area_level_1') {
              warehouse.addressState = `${addressComponent.long_name}`;
            }
            else if  (addressComponent.types[0] === 'country') {
              warehouse.addressCountry = `${addressComponent.long_name}`;
            }
            else if  (addressComponent.types[0] === 'postal_code') {
              warehouse.addressPostcode = `${addressComponent.long_name}`;
            }
          }
    
        )
      }

      sessionStorage.setItem('warehouse-maintenance.warehouse', JSON.stringify(warehouse));
      const url = this.warehouseForm.value.warehouseId.value
        ? `/warehouse-layout/warehouse-maintenance/${  this.warehouseForm.value.warehouseId.value  }/confirm`
        : '/warehouse-layout/warehouse-maintenance/confirm';

      this.router.navigateByUrl(url);
    }  
    else {
      this.displayFormError(this.warehouseForm);
    }
  }

  displayFormError(fromGroup: UntypedFormGroup): void {
    console.log(`validateForm`);
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  handleAddressChange(place: google.maps.places.PlaceResult) {  
    this.warehouseAddress = place;
     
  }
}
