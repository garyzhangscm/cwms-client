import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonPrintButtonComponent } from './print-button.component';

describe('CommonPrintButtonComponent', () => {
  let component: CommonPrintButtonComponent;
  let fixture: ComponentFixture<CommonPrintButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonPrintButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonPrintButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
