import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundPickConfirmStrategyComponent } from './pick-confirm-strategy.component';

describe('OutboundPickConfirmStrategyComponent', () => {
  let component: OutboundPickConfirmStrategyComponent;
  let fixture: ComponentFixture<OutboundPickConfirmStrategyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundPickConfirmStrategyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundPickConfirmStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
