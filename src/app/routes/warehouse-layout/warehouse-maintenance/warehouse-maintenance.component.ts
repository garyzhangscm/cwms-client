import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';

@Component({
  selector: 'app-warehouse-layout-warehouse-maintenance',
  templateUrl: './warehouse-maintenance.component.html',
})
export class WarehouseLayoutWarehouseMaintenanceComponent implements OnInit {
  pageTitle: string;
  warehouseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private i18n: I18NService,
    private titleService: TitleService,
  ) {
    titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.header.title'));
    this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.header.title');
  }

  ngOnInit(): void {
    this.warehouseForm = this.fb.group({
      warehouseId: new FormControl({ value: '', disabled: true }),
      name: new FormControl('', Validators.required),
      size: ['', Validators.required],
      addressCountry: [''],
      addressState: ['', Validators.required],
      addressCounty: [''],
      addressCity: ['', Validators.required],
      addressDistrict: [''],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      addressPostcode: ['', Validators.required],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding / changing a warehouse
      // and we already fill in all the information. Let's
      // load the changed warehouse from session storage
      let warehouseLoaded = false;
      if (params.inprocess === 'true') {
        warehouseLoaded = this.loadWarehouseFromSessionStorage();
      }

      // load from web server
      if (!warehouseLoaded) {
        this.loadWarehouseFromServer(this.activatedRoute.snapshot.params.id);
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

    this.warehouseForm.controls.warehouseId.setValue(warehouse.id);
    this.warehouseForm.patchValue(warehouse);

    return true;
  }

  loadWarehouseFromServer(warehouseId: string): void {
    if (warehouseId) {
      this.warehouseService.getWarehouse(+warehouseId).subscribe((warehouse: Warehouse) => {
        this.warehouseForm.controls.warehouseId.setValue(warehouseId);
        this.warehouseForm.patchValue(warehouse);
      });
    }
  }

  setupPageTitle(): void {
    if (this.warehouseForm.controls.warehouseId.value) {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.modify.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.modify.header.title');
    } else {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.add.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.add.header.title');
    }
  }
  goToConfirmPage(): void {
    if (this.warehouseForm.valid) {
      const warehouse: Warehouse = this.warehouseForm.value;
      warehouse.id = this.warehouseForm.controls.warehouseId.value;

      sessionStorage.setItem('warehouse-maintenance.warehouse', JSON.stringify(warehouse));
      const url = this.warehouseForm.controls.warehouseId.value
        ? '/warehouse-layout/warehouse-maintenance/' + this.warehouseForm.controls.warehouseId.value + '/confirm'
        : '/warehouse-layout/warehouse-maintenance/confirm';

      this.router.navigateByUrl(url);
    } else {
      this.displayFormError(this.warehouseForm);
    }
  }

  displayFormError(fromGroup: FormGroup): void {
    console.log(`validateForm`);
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
}
