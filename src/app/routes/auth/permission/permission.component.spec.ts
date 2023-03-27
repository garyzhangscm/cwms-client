import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthPermissionComponent } from './permission.component';

describe('AuthPermissionComponent', () => {
  let component: AuthPermissionComponent;
  let fixture: ComponentFixture<AuthPermissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
