import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRoleUserComponent } from './role-user.component';

describe('AuthRoleUserComponent', () => {
  let component: AuthRoleUserComponent;
  let fixture: ComponentFixture<AuthRoleUserComponent>;

  beforeEach(async(() => {
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
