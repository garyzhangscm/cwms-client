import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { InventoryItemFamilyComponent } from './item-family.component';

  describe('InventoryItemFamilyComponent', () => {
    let component: InventoryItemFamilyComponent;
    let fixture: ComponentFixture<InventoryItemFamilyComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryItemFamilyComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryItemFamilyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  