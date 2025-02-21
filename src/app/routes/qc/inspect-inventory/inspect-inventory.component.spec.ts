import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcInspectInventoryComponent } from './inspect-inventory.component';

describe('QcInspectInventoryComponent', () => {
  let component: QcInspectInventoryComponent;
  let fixture: ComponentFixture<QcInspectInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcInspectInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcInspectInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
