import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundShipByHualeiComponent } from './ship-by-hualei.component';

describe('OutboundShipByHualeiComponent', () => {
  let component: OutboundShipByHualeiComponent;
  let fixture: ComponentFixture<OutboundShipByHualeiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundShipByHualeiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundShipByHualeiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
