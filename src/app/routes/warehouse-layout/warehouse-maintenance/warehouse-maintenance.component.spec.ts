import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance.component';

describe('WarehouseLayoutWarehouseMaintenanceComponent', () => {
  let component: WarehouseLayoutWarehouseMaintenanceComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutWarehouseMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutWarehouseMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
