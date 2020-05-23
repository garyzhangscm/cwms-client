import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundShippingCartonizationComponent } from './shipping-cartonization.component';

describe('OutboundShippingCartonizationComponent', () => {
  let component: OutboundShippingCartonizationComponent;
  let fixture: ComponentFixture<OutboundShippingCartonizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundShippingCartonizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundShippingCartonizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
