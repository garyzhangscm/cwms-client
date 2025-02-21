import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataClientComponent } from './integration-data-client.component';

describe('IntegrationIntegrationDataClientComponent', () => {
  let component: IntegrationIntegrationDataClientComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
