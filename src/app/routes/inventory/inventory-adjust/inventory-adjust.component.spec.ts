import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryAdjustComponent } from './inventory-adjust.component';

describe('InventoryInventoryAdjustComponent', () => {
  let component: InventoryInventoryAdjustComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
