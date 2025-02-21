import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataSupplierComponent } from './integration-data-supplier.component';

describe('IntegrationIntegrationDataSupplierComponent', () => {
  let component: IntegrationIntegrationDataSupplierComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataSupplierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataSupplierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
