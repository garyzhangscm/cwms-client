import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location.component';

  describe('WarehouseLayoutWarehouseLocationComponent', () => {
    let component: WarehouseLayoutWarehouseLocationComponent;
    let fixture: ComponentFixture<WarehouseLayoutWarehouseLocationComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ WarehouseLayoutWarehouseLocationComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(WarehouseLayoutWarehouseLocationComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  