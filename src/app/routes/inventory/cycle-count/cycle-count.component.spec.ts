import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { InventoryCycleCountComponent } from './cycle-count.component';

  describe('InventoryCycleCountComponent', () => {
    let component: InventoryCycleCountComponent;
    let fixture: ComponentFixture<InventoryCycleCountComponent>;

    beforeEach(async(() => {
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
  