import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAttributeChangeConfirmComponent } from './inventory-attribute-change-confirm.component';

describe('InventoryInventoryAttributeChangeConfirmComponent', () => {
  let component: InventoryInventoryAttributeChangeConfirmComponent;
  let fixture: ComponentFixture<InventoryInventoryAttributeChangeConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAttributeChangeConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAttributeChangeConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
