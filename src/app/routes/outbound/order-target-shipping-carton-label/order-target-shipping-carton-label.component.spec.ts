import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOrderTargetShippingCartonLabelComponent } from './order-target-shipping-carton-label.component';

describe('OutboundOrderTargetShippingCartonLabelComponent', () => {
  let component: OutboundOrderTargetShippingCartonLabelComponent;
  let fixture: ComponentFixture<OutboundOrderTargetShippingCartonLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOrderTargetShippingCartonLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOrderTargetShippingCartonLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
