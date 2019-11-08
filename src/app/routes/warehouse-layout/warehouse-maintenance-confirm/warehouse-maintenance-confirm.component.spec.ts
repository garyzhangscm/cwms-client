import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm.component';

describe('WarehouseLayoutWarehouseMaintenanceConfirmComponent', () => {
  let component: WarehouseLayoutWarehouseMaintenanceConfirmComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseMaintenanceConfirmComponent>;

  beforeEach(async(() => {
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
