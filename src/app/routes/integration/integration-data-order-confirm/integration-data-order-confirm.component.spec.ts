import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataOrderConfirmComponent } from './integration-data-order-confirm.component';

describe('IntegrationIntegrationDataOrderConfirmComponent', () => {
  let component: IntegrationIntegrationDataOrderConfirmComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataOrderConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataOrderConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataOrderConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
