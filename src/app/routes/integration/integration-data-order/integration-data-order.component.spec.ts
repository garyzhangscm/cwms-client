import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataOrderComponent } from './integration-data-order.component';

describe('IntegrationIntegrationDataOrderComponent', () => {
  let component: IntegrationIntegrationDataOrderComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
