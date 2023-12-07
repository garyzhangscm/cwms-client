import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDryrunInventoryAllocationComponent } from './dryrun-inventory-allocation.component';

describe('InventoryDryrunInventoryAllocationComponent', () => {
  let component: InventoryDryrunInventoryAllocationComponent;
  let fixture: ComponentFixture<InventoryDryrunInventoryAllocationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryDryrunInventoryAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryDryrunInventoryAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
