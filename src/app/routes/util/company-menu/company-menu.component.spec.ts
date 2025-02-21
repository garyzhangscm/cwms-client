import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilCompanyMenuComponent } from './company-menu.component';

describe('UtilCompanyMenuComponent', () => {
  let component: UtilCompanyMenuComponent;
  let fixture: ComponentFixture<UtilCompanyMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilCompanyMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilCompanyMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
