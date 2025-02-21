import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseLayoutPickZoneComponent } from './pick-zone.component';

describe('WarehouseLayoutPickZoneComponent', () => {
  let component: WarehouseLayoutPickZoneComponent;
  let fixture: ComponentFixture<WarehouseLayoutPickZoneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutPickZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutPickZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
