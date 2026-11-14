import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthUserQueryPopupComponent } from './user-query-popup.component';

describe('AuthUserQueryPopupComponent', () => {
  let component: AuthUserQueryPopupComponent;
  let fixture: ComponentFixture<AuthUserQueryPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserQueryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserQueryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
