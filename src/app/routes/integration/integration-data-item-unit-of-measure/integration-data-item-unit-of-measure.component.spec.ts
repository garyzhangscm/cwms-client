import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataItemUnitOfMeasureComponent } from './integration-data-item-unit-of-measure.component';

describe('IntegrationIntegrationDataItemUnitOfMeasureComponent', () => {
  let component: IntegrationIntegrationDataItemUnitOfMeasureComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataItemUnitOfMeasureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataItemUnitOfMeasureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataItemUnitOfMeasureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
