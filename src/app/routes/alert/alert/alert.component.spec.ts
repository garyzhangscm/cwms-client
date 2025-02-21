import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertAlertComponent } from './alert.component';

describe('AlertAlertComponent', () => {
  let component: AlertAlertComponent;
  let fixture: ComponentFixture<AlertAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
