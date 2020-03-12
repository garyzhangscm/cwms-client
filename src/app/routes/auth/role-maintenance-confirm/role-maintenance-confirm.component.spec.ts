import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm.component';

describe('AuthRoleMaintenanceConfirmComponent', () => {
  let component: AuthRoleMaintenanceConfirmComponent;
  let fixture: ComponentFixture<AuthRoleMaintenanceConfirmComponent>;

  beforeEach(async(() => {
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
