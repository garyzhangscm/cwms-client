import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthWorkingTeamComponent } from './working-team.component';

describe('AuthWorkingTeamComponent', () => {
  let component: AuthWorkingTeamComponent;
  let fixture: ComponentFixture<AuthWorkingTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWorkingTeamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWorkingTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
