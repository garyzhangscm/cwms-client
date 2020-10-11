import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataCustomerComponent } from './integration-data-customer.component';

describe('IntegrationIntegrationDataCustomerComponent', () => {
  let component: IntegrationIntegrationDataCustomerComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
