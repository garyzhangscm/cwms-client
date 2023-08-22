import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonReasonCodeComponent } from './reason-code.component';

describe('CommonReasonCodeComponent', () => {
  let component: CommonReasonCodeComponent;
  let fixture: ComponentFixture<CommonReasonCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonReasonCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonReasonCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
