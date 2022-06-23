import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertWebMessageAlertDetailComponent } from './web-message-alert-detail.component';

describe('AlertWebMessageAlertDetailComponent', () => {
  let component: AlertWebMessageAlertDetailComponent;
  let fixture: ComponentFixture<AlertWebMessageAlertDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertWebMessageAlertDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertWebMessageAlertDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
