import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { InventoryCycleCountComponent } from './cycle-count.component';

  describe('InventoryCycleCountComponent', () => {
    let component: InventoryCycleCountComponent;
    let fixture: ComponentFixture<InventoryCycleCountComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryCycleCountComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryCycleCountComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  