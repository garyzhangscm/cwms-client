import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundReceiptComponent } from './receipt.component';

describe('InboundReceiptComponent', () => {
  let component: InboundReceiptComponent;
  let fixture: ComponentFixture<InboundReceiptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
