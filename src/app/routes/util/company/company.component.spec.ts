import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilCompanyComponent } from './company.component';

describe('UtilCompanyComponent', () => {
  let component: UtilCompanyComponent;
  let fixture: ComponentFixture<UtilCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
