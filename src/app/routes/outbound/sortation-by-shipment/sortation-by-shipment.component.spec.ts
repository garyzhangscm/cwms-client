import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundSortationByShipmentComponent } from './sortation-by-shipment.component';

describe('OutboundSortationByShipmentComponent', () => {
  let component: OutboundSortationByShipmentComponent;
  let fixture: ComponentFixture<OutboundSortationByShipmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundSortationByShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundSortationByShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
