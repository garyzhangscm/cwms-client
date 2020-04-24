import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataInventoryStatusChangeComponent } from './integration-data-inventory-status-change.component';

describe('IntegrationIntegrationDataInventoryStatusChangeComponent', () => {
  let component: IntegrationIntegrationDataInventoryStatusChangeComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataInventoryStatusChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataInventoryStatusChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataInventoryStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
