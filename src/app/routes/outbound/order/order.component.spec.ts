import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { OutboundOrderComponent } from './order.component';

  describe('OutboundOrderComponent', () => {
    let component: OutboundOrderComponent;
    let fixture: ComponentFixture<OutboundOrderComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundOrderComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundOrderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  