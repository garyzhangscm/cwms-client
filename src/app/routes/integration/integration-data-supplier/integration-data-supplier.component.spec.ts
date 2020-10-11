import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataSupplierComponent } from './integration-data-supplier.component';

describe('IntegrationIntegrationDataSupplierComponent', () => {
  let component: IntegrationIntegrationDataSupplierComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataSupplierComponent>;

  beforeEach(async(() => {
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
