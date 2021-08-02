import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthWorkingTeamMaintenanceConfirmComponent } from './working-team-maintenance-confirm.component';

describe('AuthWorkingTeamMaintenanceConfirmComponent', () => {
  let component: AuthWorkingTeamMaintenanceConfirmComponent;
  let fixture: ComponentFixture<AuthWorkingTeamMaintenanceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWorkingTeamMaintenanceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWorkingTeamMaintenanceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
