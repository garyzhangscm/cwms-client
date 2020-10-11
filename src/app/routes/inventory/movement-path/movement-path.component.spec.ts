import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { InventoryMovementPathComponent } from './movement-path.component';

  describe('InventoryMovementPathComponent', () => {
    let component: InventoryMovementPathComponent;
    let fixture: ComponentFixture<InventoryMovementPathComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ InventoryMovementPathComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InventoryMovementPathComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  