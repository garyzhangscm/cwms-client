import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryLockMaintenanceComponent } from './lock-maintenance.component';

describe('InventoryLockMaintenanceComponent', () => {
  let component: InventoryLockMaintenanceComponent;
  let fixture: ComponentFixture<InventoryLockMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryLockMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryLockMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
