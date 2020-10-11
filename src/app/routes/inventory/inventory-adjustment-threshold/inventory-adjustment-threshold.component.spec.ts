import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAdjustmentThresholdComponent } from './inventory-adjustment-threshold.component';

describe('InventoryInventoryAdjustmentThresholdComponent', () => {
  let component: InventoryInventoryAdjustmentThresholdComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustmentThresholdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustmentThresholdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustmentThresholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
