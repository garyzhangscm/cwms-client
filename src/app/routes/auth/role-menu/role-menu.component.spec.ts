import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthRoleMenuComponent } from './role-menu.component';

describe('AuthRoleMenuComponent', () => {
  let component: AuthRoleMenuComponent;
  let fixture: ComponentFixture<AuthRoleMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
