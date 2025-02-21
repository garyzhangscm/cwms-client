import { Directive, ElementRef,   OnInit,  Renderer2 } from '@angular/core';

import { UserService } from '../auth/services/user.service'; 
 

@Directive({
    selector: '[adminEnabled]',
    standalone: false
})
export class AdminEnabledDirective implements OnInit{
  
  element: ElementRef;

  constructor(element: ElementRef, private userService: UserService, 
     private renderer: Renderer2) {
    this.element = element;
  }

  async ngOnInit() {
    const isAdmin = await this.userService.isCurrentUserAdmin();
 
    if (!isAdmin) {  
        this.renderer.setAttribute(this.element.nativeElement, 'disabled', 'true');

    } 
  }
  
}
