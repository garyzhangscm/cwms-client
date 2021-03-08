import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryAdjustmentThresholdConfirmComponent } from './inventory-adjustment-threshold-confirm.component';

describe('InventoryInventoryAdjustmentThresholdConfirmComponent', () => {
  let component: InventoryInventoryAdjustmentThresholdConfirmComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustmentThresholdConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustmentThresholdConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustmentThresholdConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
