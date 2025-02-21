import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthWarehouseUserComponent } from './warehouse-user.component';

describe('AuthWarehouseUserComponent', () => {
  let component: AuthWarehouseUserComponent;
  let fixture: ComponentFixture<AuthWarehouseUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthWarehouseUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthWarehouseUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
