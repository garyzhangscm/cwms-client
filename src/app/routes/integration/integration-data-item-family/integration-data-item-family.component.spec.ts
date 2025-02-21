import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IntegrationIntegrationDataItemFamilyComponent } from './integration-data-item-family.component';

describe('IntegrationIntegrationDataItemFamilyComponent', () => {
  let component: IntegrationIntegrationDataItemFamilyComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataItemFamilyComponent>;

  beforeEach(waitForAsync(() => {
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
