import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryQuantityChangeConfirmComponent } from './inventory-quantity-change-confirm.component';

describe('InventoryInventoryQuantityChangeConfirmComponent', () => {
  let component: InventoryInventoryQuantityChangeConfirmComponent;
  let fixture: ComponentFixture<InventoryInventoryQuantityChangeConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryInventoryQuantityChangeConfirmComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryQuantityChangeConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
