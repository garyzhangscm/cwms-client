import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataWorkOrderConfirmComponent } from './integration-data-work-order-confirm.component';

describe('IntegrationIntegrationDataWorkOrderConfirmComponent', () => {
  let component: IntegrationIntegrationDataWorkOrderConfirmComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataWorkOrderConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataWorkOrderConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataWorkOrderConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
