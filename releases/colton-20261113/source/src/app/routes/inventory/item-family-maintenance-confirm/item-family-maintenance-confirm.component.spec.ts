import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm.component';

describe('InventoryItemFamilyMaintenanceConfirmComponent', () => {
  let component: InventoryItemFamilyMaintenanceConfirmComponent;
  let fixture: ComponentFixture<InventoryItemFamilyMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
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
