import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRoleOperationTypeComponent } from './role-operation-type.component';

describe('AuthRoleOperationTypeComponent', () => {
  let component: AuthRoleOperationTypeComponent;
  let fixture: ComponentFixture<AuthRoleOperationTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleOperationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleOperationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
