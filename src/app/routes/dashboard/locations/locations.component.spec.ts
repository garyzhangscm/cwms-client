import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardLocationsComponent } from './locations.component';

describe('DashboardLocationsComponent', () => {
  let component: DashboardLocationsComponent;
  let fixture: ComponentFixture<DashboardLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
