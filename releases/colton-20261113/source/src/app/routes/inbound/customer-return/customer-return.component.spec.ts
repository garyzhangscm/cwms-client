import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundCustomerReturnComponent } from './customer-return.component';

describe('InboundCustomerReturnComponent', () => {
  let component: InboundCustomerReturnComponent;
  let fixture: ComponentFixture<InboundCustomerReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundCustomerReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundCustomerReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
