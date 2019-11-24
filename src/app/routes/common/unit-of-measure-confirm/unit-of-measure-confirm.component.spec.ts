import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonUnitOfMeasureConfirmComponent } from './unit-of-measure-confirm.component';

describe('CommonUnitOfMeasureConfirmComponent', () => {
  let component: CommonUnitOfMeasureConfirmComponent;
  let fixture: ComponentFixture<CommonUnitOfMeasureConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonUnitOfMeasureConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonUnitOfMeasureConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
