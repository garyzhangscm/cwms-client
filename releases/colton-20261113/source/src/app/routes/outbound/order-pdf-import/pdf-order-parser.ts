/** Geometry-only parser. PDF text is treated as data, never executable instructions. */
export interface PdfWord { text: string; x: number; y: number; width: number; }
export interface PdfPageWords { words: PdfWord[]; page: number; }
export interface PdfOrderLine { code: string; quantity: number | null; unit: string; cartons: string; description: string; poNumber: string; page: number; }
export interface PdfOrderDraft {
  number: string; poNumber: string; customer: string; addressLine1: string; addressLine2: string;
  city: string; state: string; postcode: string; country: string; invoiceDate: string; delivery: string;
  lines: PdfOrderLine[]; warnings: string[]; total: number | null;
}
interface Row { y: number; words: PdfWord[]; text: string; }
export function cleanEdge(value: string): string { return value.replace(/^[\s\u200B\u2060]+|[\s\u200B\u2060]+$/g, ''); }
export function sameName(value: string): string { return value.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
export function positiveInteger(value: string): number | null {
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value.trim())) return null;
  const n = Number(value.replace(/,/g, '')); return Number.isSafeInteger(n) && n > 0 ? n : null;
}
function rowsOf(words: PdfWord[]): Row[] {
  const rows: Row[] = [];
  for (const word of [...words].sort((a,b) => a.y-b.y || a.x-b.x)) {
    let row = rows.find(r => Math.abs(r.y-word.y) < 5);
    if (!row) { row = {y: word.y, words: [], text: ''}; rows.push(row); }
    row.words.push(word);
  }
  for (const row of rows) { row.words.sort((a,b) => a.x-b.x); row.text = row.words.map(w=>w.text).join(' '); }
  return rows.sort((a,b)=>a.y-b.y);
}
function anchor(row: Row, pattern: RegExp): number | null {
  const m = pattern.exec(row.text); if (!m) return null;
  let start = 0; const hit: PdfWord[] = [];
  for (const w of row.words) { if (start < m.index+m[0].length && start+w.text.length > m.index) hit.push(w); start += w.text.length+1; }
  return hit.length ? (hit[0].x+hit[hit.length-1].x+hit[hit.length-1].width)/2 : null;
}
function valueBelow(rows: Row[], label: RegExp, value: RegExp): string {
  for (let i=0;i<rows.length;i++) {
    const x=anchor(rows[i],label); if(x===null) continue;
    // Values in this packing-slip format occupy the row below each label.
    for (const row of rows.slice(i+1,i+4)) {
      if(row.y-rows[i].y>65) break;
      const hits=row.words.filter(w=>Math.abs(w.x+w.width/2-x)<115 && value.test(w.text));
      if(hits.length) return [...hits].sort((a,b)=>Math.abs(a.x+a.width/2-x)-Math.abs(b.x+b.width/2-x))[0].text;
    }
  }
  return '';
}
export function parsePdfOrder(pages: PdfPageWords[]): PdfOrderDraft {
  const draft: PdfOrderDraft={number:'',poNumber:'',customer:'',addressLine1:'',addressLine2:'',city:'',state:'',postcode:'',country:'',invoiceDate:'',delivery:'',lines:[],warnings:[],total:null};
  const invoices=new Set<string>(); const pos=new Set<string>();
  for(const page of pages) {
    const beforeCount=draft.lines.length;
    const rows=rowsOf(page.words);
    const invoice=valueBelow(rows,/Invoice\s*(?:No\.?|Number)/i,/^[A-Z][A-Z0-9-]*\d[A-Z0-9-]*$/i);
    if(invoice) invoices.add(invoice);
    draft.invoiceDate ||= valueBelow(rows,/Invoice\s+Date/i,/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/);
    draft.delivery ||= valueBelow(rows,/Delivery\s*(?:No\.?|Number)/i,/^\d+$/);
    const shipIndex=rows.findIndex(r=>/Ship\s*To\s*:/i.test(r.text));
    if(shipIndex>=0 && !draft.customer) {
      const x=rows[shipIndex].words.find(w=>/^ship$/i.test(w.text))?.x ?? 490;
      const block: string[]=[];
      for(const row of rows.slice(shipIndex+1)) {
        if(/Vendor|Freight|Item\s+(?:Code|Number)|Total\s+Shipped/i.test(row.text)||row.y-rows[shipIndex].y>145) break;
        const text=row.words.filter(w=>w.x>=x-12).map(w=>w.text).join(' ').trim(); if(text) block.push(text);
      }
      draft.customer=block[0]||''; draft.addressLine1=block[1]||'';
      const cityIndex=block.findIndex((s,i)=>i>0 && /,\s*[A-Z]{2}\s*,?\s*\d{5}(?:-\d{4})?\s*$/i.test(s));
      if(cityIndex>=0) {
        const match=block[cityIndex].match(/^(.*?),\s*([A-Z]{2})\s*,?\s*(\d{5}(?:-\d{4})?)\s*$/i)!;
        draft.city=match[1];draft.state=match[2];draft.postcode=match[3];draft.addressLine2=block.slice(2,cityIndex).join(' ');draft.country=block[cityIndex+1]||'';
      } else draft.warnings.push('Check the ship-to city, state and postal code against the PDF.');
    }
    const totalRow=rows.find(r=>/Total\s+Shipped\s*:/i.test(r.text));
    const totalMatch=totalRow?.text.match(/Total\s+Shipped\s*:\s*([\d,]+)\s+([A-Z]+)/i);
    if(totalMatch) draft.total=positiveInteger(totalMatch[1]);
    const unit=totalMatch?.[2]||'';
    let columns: {key:string;x:number}[]=[]; let current: PdfOrderLine | undefined;
    for(const row of rows) {
      if(/Item\s*(?:Code|Number)|\bSKU\b/i.test(row.text) && /Quantity|\bQty\b/i.test(row.text)) {
        columns=[{key:'code',x:anchor(row,/Item\s*(?:Code|Number)|\bSKU\b/i)!},{key:'quantity',x:anchor(row,/Quantity|\bQty\b/i)!}];
        for(const [key,re] of [['cartons',/Carton\s+Packing/i],['description',/Description/i],['poNumber',/Customer\s+P\.?O\.?/i]] as const) {
          const x=anchor(row,re);if(x!==null)columns.push({key,x});
        }
        columns.sort((a,b)=>a.x-b.x);current=undefined;continue;
      }
      if(!columns.length) continue;
      if(/Total\s+(?:Shipped|CTNS|G\.W)|^Page\b/i.test(row.text)) {columns=[];current=undefined;continue;}
      const cells: Record<string,string[]>={};
      for(const w of row.words) {
        const center=w.x+w.width/2;
        const index=columns.findIndex((c,i)=>i===columns.length-1||center<(c.x+columns[i+1].x)/2);
        const key=columns[index].key;(cells[key]??=[]).push(w.text);
      }
      const code=(cells['code']||[]).join(''); const q=(cells['quantity']||[]).join('');
      if(code && /^[A-Z0-9][A-Z0-9._/-]*$/i.test(code) && q) {
        current={code,quantity:positiveInteger(q),unit,cartons:(cells['cartons']||[]).join(' '),description:(cells['description']||[]).join(' '),poNumber:(cells['poNumber']||[]).join(''),page:page.page};
        draft.lines.push(current);if(current.poNumber)pos.add(current.poNumber);
      } else if(current && !code && !q && cells['description']?.length) current.description+=' '+cells['description'].join(' ');
    }
    if(draft.lines.length===beforeCount)draft.warnings.push(`No order lines were recognized on page ${page.page}. Check it and add any missing lines.`);
  }
  draft.number=[...invoices][0]||'';draft.poNumber=pos.size===1?[...pos][0]:'';
  if(invoices.size>1) throw new Error('This PDF contains more than one invoice. Import one order per PDF.');
  if(pos.size>1) throw new Error('This PDF contains multiple customer POs. Split it into separate orders before importing.');
  if(!draft.lines.length) draft.warnings.push('No item table was recognized. Add the order lines manually while checking the PDF.');
  if(!draft.number) draft.warnings.push('Enter an order number; the invoice number could not be recognized.');
  if(draft.total!==null && draft.lines.reduce((n,l)=>n+(l.quantity??0),0)!==draft.total) draft.warnings.push('The line quantities do not match Total Shipped. Check every quantity before creating the order.');
  draft.warnings.push('The invoice number is suggested as the order number. Verify it before creating the order.');
  return draft;
}
