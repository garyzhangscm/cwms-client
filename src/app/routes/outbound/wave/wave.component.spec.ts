import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundWaveComponent } from './wave.component';

  describe('OutboundWaveComponent', () => {
    let component: OutboundWaveComponent;
    let fixture: ComponentFixture<OutboundWaveComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundWaveComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundWaveComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  