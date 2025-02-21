import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOutboundOrderPopupQueryComponent } from './outbound-order-popup-query.component';

describe('OutboundOutboundOrderPopupQueryComponent', () => {
  let component: OutboundOutboundOrderPopupQueryComponent;
  let fixture: ComponentFixture<OutboundOutboundOrderPopupQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOutboundOrderPopupQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOutboundOrderPopupQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
