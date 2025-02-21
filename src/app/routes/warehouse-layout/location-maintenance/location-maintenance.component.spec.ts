import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutLocationMaintenanceComponent } from './location-maintenance.component';

describe('WarehouseLayoutLocationMaintenanceComponent', () => {
  let component: WarehouseLayoutLocationMaintenanceComponent;
  let fixture: ComponentFixture<WarehouseLayoutLocationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutLocationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutLocationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
