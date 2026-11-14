import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change.component';

describe('InventoryInventoryAttributeChangeComponent', () => {
  let component: InventoryInventoryAttributeChangeComponent;
  let fixture: ComponentFixture<InventoryInventoryAttributeChangeComponent>;

  beforeEach(waitForAsync(() => {
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
