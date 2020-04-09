import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataComponent } from './integration-data.component';

describe('IntegrationIntegrationDataComponent', () => {
  let component: IntegrationIntegrationDataComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
