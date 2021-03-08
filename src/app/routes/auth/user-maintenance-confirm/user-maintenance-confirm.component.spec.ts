import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthUserMaintenanceConfirmComponent } from './user-maintenance-confirm.component';

describe('AuthUserMaintenanceConfirmComponent', () => {
  let component: AuthUserMaintenanceConfirmComponent;
  let fixture: ComponentFixture<AuthUserMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
