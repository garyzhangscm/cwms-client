import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance.component';

describe('InventoryItemFamilyMaintenanceComponent', () => {
  let component: InventoryItemFamilyMaintenanceComponent;
  let fixture: ComponentFixture<InventoryItemFamilyMaintenanceComponent>;

  beforeEach(async(() => {
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
