import { Injectable } from '@angular/core';
import { parsePdfOrder, PdfPageWords, PdfWord } from './pdf-order-parser';
export interface PdfReadResult { pages: PdfPageWords[]; previews: string[]; ocrPages: number; }
interface OcrWorker { recognize(image: HTMLCanvasElement, options: object, output: object): Promise<{data:{tsv:string}}>;
  setParameters(options: object): Promise<unknown>; terminate(): Promise<unknown>; }
@Injectable({providedIn:'root'})
export class PdfImportReaderService {
  private tesseractLoad?: Promise<void>;
  async read(file: File, forceOcr: boolean, signal: AbortSignal, progress: (s:string)=>void): Promise<PdfReadResult> {
    if(file.size>15*1024*1024)throw new Error('Choose a PDF smaller than 15 MB.');
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(!new TextDecoder().decode(bytes.slice(0,1024)).includes('%PDF-')) throw new Error('The selected file is not a PDF.');
    const base=new URL('assets/pdf-import/',document.baseURI).href;
    const pdfUrl=base+'pdf/pdf.mjs?v=4.8.69-1';
    const pdfjs=await import(/* @vite-ignore */ /* webpackIgnore: true */ pdfUrl);
    pdfjs.GlobalWorkerOptions.workerSrc=base+'pdf/pdf.worker.mjs?v=4.8.69-1';
    const loading=pdfjs.getDocument({data:bytes,isEvalSupported:false,cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/'});
    let worker: OcrWorker | undefined; let stopped=false;
    const abort=()=>{stopped=true;void loading.destroy();if(worker)void worker.terminate();};
    signal.addEventListener('abort',abort,{once:true});
    const check=()=>{if(stopped||signal.aborted)throw new Error('Recognition cancelled.');};
    try {
      check();const pdf=await loading.promise;check();
      if(pdf.numPages>10)throw new Error('Import at most 10 pages at a time. Split this PDF first.');
      const result: PdfReadResult={pages:[],previews:[],ocrPages:0};
      for(let index=1;index<=pdf.numPages;index++) {
        check();progress(`Reading page ${index} of ${pdf.numPages}…`);
        const page=await pdf.getPage(index);const viewport=page.getViewport({scale:1});const text=await page.getTextContent();
        let words: PdfWord[]=[];
        for(const item of text.items) {
          if(!('str' in item)||!item.str.trim())continue;
          const [x,y]=viewport.convertToViewportPoint(item.transform[4],item.transform[5]);
          const tokens=[...item.str.matchAll(/\S+/g)];
          for(const token of tokens)words.push({text:token[0],x:(x+item.width*(token.index??0)/item.str.length)/viewport.width*1000,y:y/viewport.height*1000,width:item.width*token[0].length/item.str.length/viewport.width*1000});
        }
        const scale=Math.min(2.5,Math.sqrt(8_000_000/(viewport.width*viewport.height)));
        const renderViewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(renderViewport.width);canvas.height=Math.ceil(renderViewport.height);
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Could not prepare the PDF preview.');
        await page.render({canvasContext:ctx,viewport:renderViewport}).promise;check();
        result.previews.push(canvas.toDataURL('image/jpeg',0.85));
        if(forceOcr||words.map(w=>w.text).join('').length<80||!parsePdfOrder([{page:index,words}]).lines.length) {
          progress(`Recognizing scanned page ${index} of ${pdf.numPages}…`);
          if(!worker) {
            await this.loadOcr(base);check();
            const api=(window as unknown as {Tesseract:{createWorker(lang:string,oem:number,options:object):Promise<OcrWorker>}}).Tesseract;
            const creating=api.createWorker('eng',1,{workerPath:base+'ocr/worker.min.js',corePath:base+'core',langPath:base+'lang',workerBlobURL:false,cacheMethod:'none'});
            let timer: ReturnType<typeof setTimeout> | undefined;
            try { worker=await Promise.race([creating,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('OCR initialization timed out. Please retry.')),90000);})]); }
            catch(error) {void creating.then(w=>w.terminate(),()=>undefined);throw error;}
            finally {if(timer)clearTimeout(timer);}
            check();await worker.setParameters({preserve_interword_spaces:'1',user_defined_dpi:'200',tessedit_pageseg_mode:'11'});
          }
          const output=await worker.recognize(canvas,{}, {text:true,tsv:true});check();words=[];
          for(const row of output.data.tsv.split('\n').slice(1)) {
            const c=row.split('\t');if(c.length<12||c[0]!=='5'||!c[11].trim())continue;
            words.push({text:c.slice(11).join('\t').trim(),x:Number(c[6])/canvas.width*1000,y:(Number(c[7])+Number(c[9]))/canvas.height*1000,width:Number(c[8])/canvas.width*1000});
          }
          result.ocrPages++;
        }
        result.pages.push({page:index,words});canvas.width=canvas.height=0;page.cleanup();
      }
      return result;
    } catch(error) {
      if(signal.aborted)throw new Error('Recognition cancelled.');
      if(error instanceof Error && /password/i.test(error.message))throw new Error('This PDF is password protected. Upload an unlocked copy.');
      throw error;
    } finally {signal.removeEventListener('abort',abort);if(worker)await worker.terminate().catch(()=>undefined);await loading.destroy().catch(()=>undefined);}
  }
  private loadOcr(base:string): Promise<void> {
    if(!this.tesseractLoad) this.tesseractLoad=new Promise<void>((resolve,reject)=>{
      const script=document.createElement('script');script.src=base+'ocr/tesseract.min.js';script.onload=()=>resolve();script.onerror=()=>{this.tesseractLoad=undefined;script.remove();reject(new Error('Could not load the local OCR engine.'));};document.head.appendChild(script);
    });
    return this.tesseractLoad;
  }
}
