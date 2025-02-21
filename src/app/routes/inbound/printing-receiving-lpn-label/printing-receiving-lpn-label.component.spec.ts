import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundPrintingReceivingLpnLabelComponent } from './printing-receiving-lpn-label.component';

describe('InboundPrintingReceivingLpnLabelComponent', () => {
  let component: InboundPrintingReceivingLpnLabelComponent;
  let fixture: ComponentFixture<InboundPrintingReceivingLpnLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPrintingReceivingLpnLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPrintingReceivingLpnLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
