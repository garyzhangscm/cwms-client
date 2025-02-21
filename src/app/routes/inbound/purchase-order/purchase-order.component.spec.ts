import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundPurchaseOrderComponent } from './purchase-order.component';

describe('InboundPurchaseOrderComponent', () => {
  let component: InboundPurchaseOrderComponent;
  let fixture: ComponentFixture<InboundPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
