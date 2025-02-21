import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryAgingSnapshotComponent } from './inventory-aging-snapshot.component';

describe('InventoryInventoryAgingSnapshotComponent', () => {
  let component: InventoryInventoryAgingSnapshotComponent;
  let fixture: ComponentFixture<InventoryInventoryAgingSnapshotComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryAgingSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryAgingSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
