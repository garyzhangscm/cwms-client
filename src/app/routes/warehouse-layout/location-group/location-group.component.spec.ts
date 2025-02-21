import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { WarehouseLayoutLocationGroupComponent } from './location-group.component';

  describe('WarehouseLayoutLocationGroupComponent', () => {
    let component: WarehouseLayoutLocationGroupComponent;
    let fixture: ComponentFixture<WarehouseLayoutLocationGroupComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ WarehouseLayoutLocationGroupComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(WarehouseLayoutLocationGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  