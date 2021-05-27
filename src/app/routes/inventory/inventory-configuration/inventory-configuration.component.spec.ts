import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryConfigurationComponent } from './inventory-configuration.component';

describe('InventoryInventoryConfigurationComponent', () => {
  let component: InventoryInventoryConfigurationComponent;
  let fixture: ComponentFixture<InventoryInventoryConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
