import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertSubscriptionComponent } from './subscription.component';

describe('AlertSubscriptionComponent', () => {
  let component: AlertSubscriptionComponent;
  let fixture: ComponentFixture<AlertSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
