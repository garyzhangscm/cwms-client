import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemMaintenanceComponent } from './item-maintenance.component';

describe('InventoryItemMaintenanceComponent', () => {
  let component: InventoryItemMaintenanceComponent;
  let fixture: ComponentFixture<InventoryItemMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
