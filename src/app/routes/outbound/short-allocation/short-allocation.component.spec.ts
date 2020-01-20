import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { OutboundShortAllocationComponent } from './short-allocation.component';

  describe('OutboundShortAllocationComponent', () => {
    let component: OutboundShortAllocationComponent;
    let fixture: ComponentFixture<OutboundShortAllocationComponent>;

    beforeEach(async(() => {
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
  