import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilMenuComponent } from './menu.component';

describe('UtilMenuComponent', () => {
  let component: UtilMenuComponent;
  let fixture: ComponentFixture<UtilMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
