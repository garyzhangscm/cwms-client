import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventorySnapshotConfigurationComponent } from './inventory-snapshot-configuration.component';

describe('InventoryInventorySnapshotConfigurationComponent', () => {
  let component: InventoryInventorySnapshotConfigurationComponent;
  let fixture: ComponentFixture<InventoryInventorySnapshotConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventorySnapshotConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventorySnapshotConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
