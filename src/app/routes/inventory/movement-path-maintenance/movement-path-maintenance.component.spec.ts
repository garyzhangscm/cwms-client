import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryMovementPathMaintenanceComponent } from './movement-path-maintenance.component';

describe('InventoryMovementPathMaintenanceComponent', () => {
  let component: InventoryMovementPathMaintenanceComponent;
  let fixture: ComponentFixture<InventoryMovementPathMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryMovementPathMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryMovementPathMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
