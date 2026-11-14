import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthDepartmentComponent } from './department.component';

describe('AuthDepartmentComponent', () => {
  let component: AuthDepartmentComponent;
  let fixture: ComponentFixture<AuthDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
