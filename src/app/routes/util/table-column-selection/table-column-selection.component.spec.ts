import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilTableColumnSelectionComponent } from './table-column-selection.component';

describe('UtilTableColumnSelectionComponent', () => {
  let component: UtilTableColumnSelectionComponent;
  let fixture: ComponentFixture<UtilTableColumnSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilTableColumnSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilTableColumnSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
