import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthUserRoleComponent } from './user-role.component';

describe('AuthUserRoleComponent', () => {
  let component: AuthUserRoleComponent;
  let fixture: ComponentFixture<AuthUserRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
