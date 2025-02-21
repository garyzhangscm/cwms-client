import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundStopComponent } from './stop.component';

  describe('OutboundStopComponent', () => {
    let component: OutboundStopComponent;
    let fixture: ComponentFixture<OutboundStopComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundStopComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundStopComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  