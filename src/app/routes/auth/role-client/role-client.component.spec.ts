import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthRoleClientComponent } from './role-client.component';

describe('AuthRoleClientComponent', () => {
  let component: AuthRoleClientComponent;
  let fixture: ComponentFixture<AuthRoleClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRoleClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRoleClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
