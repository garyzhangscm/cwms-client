import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundPickComponent } from './pick.component';

  describe('OutboundPickComponent', () => {
    let component: OutboundPickComponent;
    let fixture: ComponentFixture<OutboundPickComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundPickComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundPickComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  