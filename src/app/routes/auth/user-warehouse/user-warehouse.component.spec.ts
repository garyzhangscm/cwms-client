import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthUserWarehouseComponent } from './user-warehouse.component';

describe('AuthUserWarehouseComponent', () => {
  let component: AuthUserWarehouseComponent;
  let fixture: ComponentFixture<AuthUserWarehouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserWarehouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
