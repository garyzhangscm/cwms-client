import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

  import { InventoryItemComponent } from './item.component';

  describe('InventoryItemComponent', () => {
    let component: InventoryItemComponent;
    let fixture: ComponentFixture<InventoryItemComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryItemComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  