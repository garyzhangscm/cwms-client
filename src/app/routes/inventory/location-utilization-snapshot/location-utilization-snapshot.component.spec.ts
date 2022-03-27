import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryLocationUtilizationSnapshotComponent } from './location-utilization-snapshot.component';

describe('InventoryLocationUtilizationSnapshotComponent', () => {
  let component: InventoryLocationUtilizationSnapshotComponent;
  let fixture: ComponentFixture<InventoryLocationUtilizationSnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryLocationUtilizationSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryLocationUtilizationSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
