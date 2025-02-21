import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryInventoryMixRestrictionMaintenanceComponent } from './inventory-mix-restriction-maintenance.component';

describe('InventoryInventoryMixRestrictionMaintenanceComponent', () => {
  let component: InventoryInventoryMixRestrictionMaintenanceComponent;
  let fixture: ComponentFixture<InventoryInventoryMixRestrictionMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryMixRestrictionMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryMixRestrictionMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
