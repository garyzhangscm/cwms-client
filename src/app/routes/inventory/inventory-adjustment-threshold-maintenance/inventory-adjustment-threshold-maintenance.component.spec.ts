import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAdjustmentThresholdMaintenanceComponent } from './inventory-adjustment-threshold-maintenance.component';

describe('InventoryInventoryAdjustmentThresholdMaintenanceComponent', () => {
  let component: InventoryInventoryAdjustmentThresholdMaintenanceComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustmentThresholdMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustmentThresholdMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustmentThresholdMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
