import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryQuantityChangeComponent } from './inventory-quantity-change.component';

describe('InventoryInventoryQuantityChangeComponent', () => {
  let component: InventoryInventoryQuantityChangeComponent;
  let fixture: ComponentFixture<InventoryInventoryQuantityChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryQuantityChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryQuantityChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
