export interface PrintableBarcode {
    pageNumber: number;
    top: number;
    left: number; 
    width: number;
    height: number;
    // valid barcode type based on LODOP
    // 1-D:
    // - 128A, 128B, 128C, 128Auto, EAN8, EAN13, EAN128A
    // - EAN128B, EAN128C, Code39, 39Extended, 2_5interleaved,
    // - 2_5industrial, 2_5matrix, UPC_A, UPC_E0, UPC_E1, UPCsupp2,
    // - UPCsupp5, Code93, 93Extended, MSI, PostNet, Codabar,
    // 2-D:
    // - QRCode, PDF417
    barCodeType: string;
    barCodeValue: string;
}
