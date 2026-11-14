import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundCustomerReturnReceiveComponent } from './customer-return-receive.component';

describe('InboundCustomerReturnReceiveComponent', () => {
  let component: InboundCustomerReturnReceiveComponent;
  let fixture: ComponentFixture<InboundCustomerReturnReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundCustomerReturnReceiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundCustomerReturnReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
