import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change.component';

describe('InventoryInventoryAttributeChangeComponent', () => {
  let component: InventoryInventoryAttributeChangeComponent;
  let fixture: ComponentFixture<InventoryInventoryAttributeChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAttributeChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAttributeChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
