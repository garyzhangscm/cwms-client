import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundCompleteOrderComponent } from './complete-order.component';

describe('OutboundCompleteOrderComponent', () => {
  let component: OutboundCompleteOrderComponent;
  let fixture: ComponentFixture<OutboundCompleteOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCompleteOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCompleteOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
