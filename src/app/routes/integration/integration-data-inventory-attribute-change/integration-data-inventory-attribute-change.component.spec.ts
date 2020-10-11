import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataInventoryAttributeChangeComponent } from './integration-data-inventory-attribute-change.component';

describe('IntegrationIntegrationDataInventoryAttributeChangeComponent', () => {
  let component: IntegrationIntegrationDataInventoryAttributeChangeComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataInventoryAttributeChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataInventoryAttributeChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataInventoryAttributeChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
