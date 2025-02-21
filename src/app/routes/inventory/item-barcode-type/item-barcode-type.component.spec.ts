import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemBarcodeTypeComponent } from './item-barcode-type.component';

describe('InventoryItemBarcodeTypeComponent', () => {
  let component: InventoryItemBarcodeTypeComponent;
  let fixture: ComponentFixture<InventoryItemBarcodeTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemBarcodeTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemBarcodeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
