import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundCompleteWaveComponent } from './complete-wave.component';

describe('OutboundCompleteWaveComponent', () => {
  let component: OutboundCompleteWaveComponent;
  let fixture: ComponentFixture<OutboundCompleteWaveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCompleteWaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCompleteWaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
