import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundTrailerComponent } from './trailer.component';

  describe('OutboundTrailerComponent', () => {
    let component: OutboundTrailerComponent;
    let fixture: ComponentFixture<OutboundTrailerComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundTrailerComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundTrailerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  