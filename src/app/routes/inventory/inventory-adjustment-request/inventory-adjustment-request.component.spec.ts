import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryAdjustmentRequestComponent } from './inventory-adjustment-request.component';

describe('InventoryInventoryAdjustmentRequestComponent', () => {
  let component: InventoryInventoryAdjustmentRequestComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustmentRequestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustmentRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustmentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
