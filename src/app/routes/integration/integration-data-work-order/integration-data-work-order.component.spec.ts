import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataWorkOrderComponent } from './integration-data-work-order.component';

describe('IntegrationIntegrationDataWorkOrderComponent', () => {
  let component: IntegrationIntegrationDataWorkOrderComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataWorkOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataWorkOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataWorkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
