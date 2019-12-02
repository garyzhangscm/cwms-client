import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAdjustConfirmComponent } from './inventory-adjust-confirm.component';

describe('InventoryInventoryAdjustConfirmComponent', () => {
  let component: InventoryInventoryAdjustConfirmComponent;
  let fixture: ComponentFixture<InventoryInventoryAdjustConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAdjustConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAdjustConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
