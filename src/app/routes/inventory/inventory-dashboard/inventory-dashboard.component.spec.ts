import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryDashboardComponent } from './inventory-dashboard.component';

describe('InventoryInventoryDashboardComponent', () => {
  let component: InventoryInventoryDashboardComponent;
  let fixture: ComponentFixture<InventoryInventoryDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
