import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundShipmentDisplayComponent } from './shipment-display.component';

describe('OutboundShipmentDisplayComponent', () => {
  let component: OutboundShipmentDisplayComponent;
  let fixture: ComponentFixture<OutboundShipmentDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundShipmentDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundShipmentDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
