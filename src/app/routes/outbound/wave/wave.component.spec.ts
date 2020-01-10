import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { OutboundWaveComponent } from './wave.component';

  describe('OutboundWaveComponent', () => {
    let component: OutboundWaveComponent;
    let fixture: ComponentFixture<OutboundWaveComponent>;

    beforeEach(async(() => {
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
  