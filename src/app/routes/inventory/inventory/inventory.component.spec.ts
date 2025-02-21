import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

  import { InventoryInventoryComponent } from './inventory.component';

  describe('InventoryInventoryComponent', () => {
    let component: InventoryInventoryComponent;
    let fixture: ComponentFixture<InventoryInventoryComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryInventoryComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryInventoryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  