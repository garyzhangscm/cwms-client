import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm.component';

describe('InventoryItemFamilyMaintenanceConfirmComponent', () => {
  let component: InventoryItemFamilyMaintenanceConfirmComponent;
  let fixture: ComponentFixture<InventoryItemFamilyMaintenanceConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemFamilyMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemFamilyMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
