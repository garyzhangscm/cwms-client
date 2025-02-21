import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutWarehouseLayoutMaintenanceComponent } from './warehouse-layout-maintenance.component';

describe('WarehouseLayoutWarehouseLayoutMaintenanceComponent', () => {
  let component: WarehouseLayoutWarehouseLayoutMaintenanceComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseLayoutMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutWarehouseLayoutMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutWarehouseLayoutMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
