import { RFAppVersionByRFCode } from "./rf-app-version-by-rf-code";

export interface RFAppVersion {
    
    id?: number;

    versionNumber: string;
    fileName: string;
    latestVersion: boolean;
    companyId: number;
    releaseNote: string;
    releaseDate: Date;

    apkDownloadUrl?: string;

    rfAppVersionByRFCodes :RFAppVersionByRFCode[] ;

}
