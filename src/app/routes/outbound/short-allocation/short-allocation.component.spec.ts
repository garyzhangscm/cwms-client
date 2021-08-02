import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { OutboundShortAllocationComponent } from './short-allocation.component';

  describe('OutboundShortAllocationComponent', () => {
    let component: OutboundShortAllocationComponent;
    let fixture: ComponentFixture<OutboundShortAllocationComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ OutboundShortAllocationComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(OutboundShortAllocationComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  