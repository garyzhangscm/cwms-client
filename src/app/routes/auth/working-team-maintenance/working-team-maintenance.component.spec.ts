import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthWorkingTeamMaintenanceComponent } from './working-team-maintenance.component';

describe('AuthWorkingTeamMaintenanceComponent', () => {
  let component: AuthWorkingTeamMaintenanceComponent;
  let fixture: ComponentFixture<AuthWorkingTeamMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWorkingTeamMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWorkingTeamMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
