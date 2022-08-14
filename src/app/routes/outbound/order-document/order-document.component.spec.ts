import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOrderDocumentComponent } from './order-document.component';

describe('OutboundOrderDocumentComponent', () => {
  let component: OutboundOrderDocumentComponent;
  let fixture: ComponentFixture<OutboundOrderDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOrderDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOrderDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
