import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataItemFamilyComponent } from './integration-data-item-family.component';

describe('IntegrationIntegrationDataItemFamilyComponent', () => {
  let component: IntegrationIntegrationDataItemFamilyComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataItemFamilyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataItemFamilyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataItemFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
