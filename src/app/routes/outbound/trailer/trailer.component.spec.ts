import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { OutboundTrailerComponent } from './trailer.component';

  describe('OutboundTrailerComponent', () => {
    let component: OutboundTrailerComponent;
    let fixture: ComponentFixture<OutboundTrailerComponent>;

    beforeEach(async(() => {
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
  