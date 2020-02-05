import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { AuthRoleComponent } from './role.component';

  describe('AuthRoleComponent', () => {
    let component: AuthRoleComponent;
    let fixture: ComponentFixture<AuthRoleComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ AuthRoleComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AuthRoleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  