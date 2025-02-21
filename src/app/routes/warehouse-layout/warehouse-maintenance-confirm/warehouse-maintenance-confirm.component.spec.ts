import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm.component';

describe('WarehouseLayoutWarehouseMaintenanceConfirmComponent', () => {
  let component: WarehouseLayoutWarehouseMaintenanceConfirmComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutWarehouseMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutWarehouseMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
