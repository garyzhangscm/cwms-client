import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundShipmentComponent } from './shipment.component';

  describe('OutboundShipmentComponent', () => {
    let component: OutboundShipmentComponent;
    let fixture: ComponentFixture<OutboundShipmentComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundShipmentComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundShipmentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  