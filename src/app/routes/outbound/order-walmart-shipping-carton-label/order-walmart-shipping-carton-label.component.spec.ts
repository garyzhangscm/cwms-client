import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOrderWalmartShippingCartonLabelComponent } from './order-walmart-shipping-carton-label.component';

describe('OutboundOrderWalmartShippingCartonLabelComponent', () => {
  let component: OutboundOrderWalmartShippingCartonLabelComponent;
  let fixture: ComponentFixture<OutboundOrderWalmartShippingCartonLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOrderWalmartShippingCartonLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOrderWalmartShippingCartonLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
