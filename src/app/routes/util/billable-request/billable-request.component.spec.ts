import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilBillableRequestComponent } from './billable-request.component';

describe('UtilBillableRequestComponent', () => {
  let component: UtilBillableRequestComponent;
  let fixture: ComponentFixture<UtilBillableRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilBillableRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilBillableRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
