import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { CommonCustomerComponent } from './customer.component';

  describe('CommonCustomerComponent', () => {
    let component: CommonCustomerComponent;
    let fixture: ComponentFixture<CommonCustomerComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ CommonCustomerComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommonCustomerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  