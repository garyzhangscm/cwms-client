import { Directive, ElementRef,  OnInit } from '@angular/core';

import { UserService } from '../auth/services/user.service';
 

@Directive({
    selector: '[adminAccess]',
    standalone: false
})
export class AdminAccessDirective implements OnInit{
  
  element: ElementRef;

  constructor(element: ElementRef, private userService: UserService, 
     ) {
    this.element = element;
  }

  async ngOnInit() {
    
    const isAdmin = await this.userService.isCurrentUserAdmin();
 
    if (!isAdmin) { 
        this.element.nativeElement.parentNode.removeChild(this.element.nativeElement);

    } 
  }
  
}
