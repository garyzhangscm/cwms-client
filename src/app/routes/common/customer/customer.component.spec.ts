import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

  import { CommonCustomerComponent } from './customer.component';

  describe('CommonCustomerComponent', () => {
    let component: CommonCustomerComponent;
    let fixture: ComponentFixture<CommonCustomerComponent>;

    beforeEach(waitForAsync(() => {
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
  