import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthDepartmentMaintenanceComponent } from './department-maintenance.component';

describe('AuthDepartmentMaintenanceComponent', () => {
  let component: AuthDepartmentMaintenanceComponent;
  let fixture: ComponentFixture<AuthDepartmentMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthDepartmentMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDepartmentMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
