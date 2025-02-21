import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRolePermissionComponent } from './role-permission.component';

describe('AuthRolePermissionComponent', () => {
  let component: AuthRolePermissionComponent;
  let fixture: ComponentFixture<AuthRolePermissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRolePermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRolePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
