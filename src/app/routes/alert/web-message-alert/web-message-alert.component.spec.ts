import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertWebMessageAlertComponent } from './web-message-alert.component';

describe('AlertWebMessageAlertComponent', () => {
  let component: AlertWebMessageAlertComponent;
  let fixture: ComponentFixture<AlertWebMessageAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertWebMessageAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertWebMessageAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
