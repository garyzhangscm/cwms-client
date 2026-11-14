import type { Item } from '../../inventory/models/item';
export interface PdfUnitChoice { key:string; label:string; name:string; factor:number; base:string; }
export function unitChoices(item:Item): PdfUnitChoice[] {
  const choices:PdfUnitChoice[]=[];
  const packages=item.itemPackageTypes?.length?item.itemPackageTypes:item.defaultItemPackageType?[item.defaultItemPackageType]:[];
  packages.forEach((pack,index)=>{
    const stock=pack.stockItemUnitOfMeasure;
    const base=stock?.unitOfMeasure?.name;
    if(!base)return;
    const packKey=String(pack.id??index);
    choices.push({key:packKey+':base',label:`${base} · ${pack.name||'Base unit'}`,name:base,factor:1,base});
    for(const [i,u] of (pack.itemUnitOfMeasures||[]).entries()) {
      if(!u.unitOfMeasure?.name||!u.quantity||!stock.quantity||u.quantity<=0||stock.quantity<=0)continue;
      const factor=u.quantity/stock.quantity;
      if(!Number.isFinite(factor)||factor<=0)continue;
      if(u.unitOfMeasure.name===base&&factor===1)continue;
      choices.push({key:packKey+':'+String(u.id??i),name:u.unitOfMeasure.name,base,factor,
        label:`${u.unitOfMeasure.name} · ${pack.name||'Package'} (1 = ${factor} ${base})`});
    }
  });
  return choices;
}
export function suggestUnit(choices:PdfUnitChoice[],source:string): string {
  const normalize=(s:string)=>s.trim().toUpperCase();
  let hits=choices.filter(c=>normalize(c.name)===normalize(source));
  if(!hits.length&&['EA','EACH','PCS','PC','PIECE','PIECES'].includes(normalize(source)))
    hits=choices.filter(c=>['EA','EACH','PCS','PC','PIECE','PIECES'].includes(normalize(c.name))&&c.factor===1);
  return hits.length&&hits.every(c=>c.factor===hits[0].factor&&c.base===hits[0].base)?hits[0].key:'';
}
export function baseQuantity(quantity:number|null,choice:PdfUnitChoice|undefined): number|null {
  if(quantity===null||!Number.isSafeInteger(quantity)||quantity<=0||!choice)return null;
  const n=quantity*choice.factor;
  return Number.isSafeInteger(n)&&n>0?n:null;
}
