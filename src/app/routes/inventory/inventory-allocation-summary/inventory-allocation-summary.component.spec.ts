import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAllocationSummaryComponent } from './inventory-allocation-summary.component';

describe('InventoryInventoryAllocationSummaryComponent', () => {
  let component: InventoryInventoryAllocationSummaryComponent;
  let fixture: ComponentFixture<InventoryInventoryAllocationSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAllocationSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAllocationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
