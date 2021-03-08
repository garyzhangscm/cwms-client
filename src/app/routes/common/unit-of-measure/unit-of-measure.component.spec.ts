import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { CommonUnitOfMeasureComponent } from './unit-of-measure.component';

  describe('CommonUnitOfMeasureComponent', () => {
    let component: CommonUnitOfMeasureComponent;
    let fixture: ComponentFixture<CommonUnitOfMeasureComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ CommonUnitOfMeasureComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommonUnitOfMeasureComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  