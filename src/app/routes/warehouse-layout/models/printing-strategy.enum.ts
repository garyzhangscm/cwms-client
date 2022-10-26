export enum PrintingStrategy {
  SERVER_PRINTER = 'SERVER_PRINTER',   // print from server's printer
  LOCAL_PRINTER_SERVER_DATA = 'LOCAL_PRINTER_SERVER_DATA',  // print from local printer, data from server
  LOCAL_PRINTER_LOCAL_DATA = 'LOCAL_PRINTER_LOCAL_DATA',  // print from local printer, data from local (html content)
}
