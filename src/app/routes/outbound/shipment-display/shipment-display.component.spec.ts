import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundShipmentDisplayComponent } from './shipment-display.component';

describe('OutboundShipmentDisplayComponent', () => {
  let component: OutboundShipmentDisplayComponent;
  let fixture: ComponentFixture<OutboundShipmentDisplayComponent>;

  beforeEach(async(() => {
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
