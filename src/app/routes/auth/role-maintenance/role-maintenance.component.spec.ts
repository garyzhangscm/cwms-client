import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRoleMaintenanceComponent } from './role-maintenance.component';

describe('AuthRoleMaintenanceComponent', () => {
  let component: AuthRoleMaintenanceComponent;
  let fixture: ComponentFixture<AuthRoleMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
