import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventorySnapshotComponent } from './inventory-snapshot.component';

describe('InventoryInventorySnapshotComponent', () => {
  let component: InventoryInventorySnapshotComponent;
  let fixture: ComponentFixture<InventoryInventorySnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventorySnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventorySnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
