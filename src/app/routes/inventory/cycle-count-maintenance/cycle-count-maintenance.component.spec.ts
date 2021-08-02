import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryCycleCountMaintenanceComponent } from './cycle-count-maintenance.component';

describe('InventoryCycleCountMaintenanceComponent', () => {
  let component: InventoryCycleCountMaintenanceComponent;
  let fixture: ComponentFixture<InventoryCycleCountMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryCycleCountMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryCycleCountMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
