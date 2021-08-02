import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthRoleUserComponent } from './role-user.component';

describe('AuthRoleUserComponent', () => {
  let component: AuthRoleUserComponent;
  let fixture: ComponentFixture<AuthRoleUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
