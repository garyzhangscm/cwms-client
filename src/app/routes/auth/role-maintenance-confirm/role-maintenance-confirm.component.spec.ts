import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm.component';

describe('AuthRoleMaintenanceConfirmComponent', () => {
  let component: AuthRoleMaintenanceConfirmComponent;
  let fixture: ComponentFixture<AuthRoleMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
