import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }
  
  // https://htmlcolorcodes.com/color-names/
  get White(){return "#FFFFFF";} 
  get Gray(){return "#808080";} 
  get Red(){return "#ff0000";} 
  get Orange(){return "#FFA500";} 
  get Yellow(){return "#FFFF00";} 
  get Purple(){return "#800080";} 
  get Green(){return "#008000";} 
  get Blue(){return "#0000FF";} 
  get Brown(){return "#A52A2A";} 
  get Black(){return "#000000";} 
  
}
