import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthWorkingTeamUserComponent } from './working-team-user.component';

describe('AuthWorkingTeamUserComponent', () => {
  let component: AuthWorkingTeamUserComponent;
  let fixture: ComponentFixture<AuthWorkingTeamUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWorkingTeamUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWorkingTeamUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
