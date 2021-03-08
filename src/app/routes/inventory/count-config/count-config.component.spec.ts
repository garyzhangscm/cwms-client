import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { InventoryCountConfigComponent } from './count-config.component';

  describe('InventoryCountConfigComponent', () => {
    let component: InventoryCountConfigComponent;
    let fixture: ComponentFixture<InventoryCountConfigComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryCountConfigComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryCountConfigComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  