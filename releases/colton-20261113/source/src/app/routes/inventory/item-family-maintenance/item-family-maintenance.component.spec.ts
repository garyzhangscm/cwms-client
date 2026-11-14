import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance.component';

describe('InventoryItemFamilyMaintenanceComponent', () => {
  let component: InventoryItemFamilyMaintenanceComponent;
  let fixture: ComponentFixture<InventoryItemFamilyMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemFamilyMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemFamilyMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
