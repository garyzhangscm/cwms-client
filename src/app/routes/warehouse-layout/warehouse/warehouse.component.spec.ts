import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutWarehouseComponent } from './warehouse.component';

describe('WarehouseLayoutWarehouseComponent', () => {
  let component: WarehouseLayoutWarehouseComponent;
  let fixture: ComponentFixture<WarehouseLayoutWarehouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutWarehouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
