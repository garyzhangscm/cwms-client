import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryStatusMaintenanceComponent } from './inventory-status-maintenance.component';

describe('InventoryInventoryStatusMaintenanceComponent', () => {
  let component: InventoryInventoryStatusMaintenanceComponent;
  let fixture: ComponentFixture<InventoryInventoryStatusMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryStatusMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryStatusMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
