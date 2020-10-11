import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataItemComponent } from './integration-data-item.component';

describe('IntegrationIntegrationDataItemComponent', () => {
  let component: IntegrationIntegrationDataItemComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
