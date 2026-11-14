import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutWarehouseConfigurationComponent } from './warehouse-configuration.component';

describe('WarehouseLayoutWarehouseConfigurationComponent', () => {
  let component: WarehouseLayoutWarehouseConfigurationComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutWarehouseConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutWarehouseConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
