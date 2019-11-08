import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm.component';

describe('WarehouseLayoutLocationGroupMaintenanceConfirmComponent', () => {
  let component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent;
  let fixture: ComponentFixture<WarehouseLayoutLocationGroupMaintenanceConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutLocationGroupMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutLocationGroupMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
