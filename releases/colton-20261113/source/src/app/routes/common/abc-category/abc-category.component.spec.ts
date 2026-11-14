import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonAbcCategoryComponent } from './abc-category.component';

describe('CommonAbcCategoryComponent', () => {
  let component: CommonAbcCategoryComponent;
  let fixture: ComponentFixture<CommonAbcCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonAbcCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonAbcCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
