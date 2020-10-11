import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { CommonSupplierComponent } from './supplier.component';

  describe('CommonSupplierComponent', () => {
    let component: CommonSupplierComponent;
    let fixture: ComponentFixture<CommonSupplierComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ CommonSupplierComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommonSupplierComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  