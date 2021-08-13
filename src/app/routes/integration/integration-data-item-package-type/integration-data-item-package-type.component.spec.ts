import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataItemPackageTypeComponent } from './integration-data-item-package-type.component';

describe('IntegrationIntegrationDataItemPackageTypeComponent', () => {
  let component: IntegrationIntegrationDataItemPackageTypeComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataItemPackageTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataItemPackageTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataItemPackageTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
