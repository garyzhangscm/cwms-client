import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemSamplingMaintenanceComponent } from './item-sampling-maintenance.component';

describe('InventoryItemSamplingMaintenanceComponent', () => {
  let component: InventoryItemSamplingMaintenanceComponent;
  let fixture: ComponentFixture<InventoryItemSamplingMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemSamplingMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemSamplingMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
