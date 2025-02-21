import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutLocationDashboardComponent } from './location-dashboard.component';

describe('WarehouseLayoutLocationDashboardComponent', () => {
  let component: WarehouseLayoutLocationDashboardComponent;
  let fixture: ComponentFixture<WarehouseLayoutLocationDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutLocationDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutLocationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
