import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthUserMaintenanceComponent } from './user-maintenance.component';

describe('AuthUserMaintenanceComponent', () => {
  let component: AuthUserMaintenanceComponent;
  let fixture: ComponentFixture<AuthUserMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
