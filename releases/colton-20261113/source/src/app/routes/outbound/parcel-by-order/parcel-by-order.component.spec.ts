import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundParcelByOrderComponent } from './parcel-by-order.component';

describe('OutboundParcelByOrderComponent', () => {
  let component: OutboundParcelByOrderComponent;
  let fixture: ComponentFixture<OutboundParcelByOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundParcelByOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundParcelByOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
