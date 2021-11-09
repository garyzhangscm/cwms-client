export interface RFAppVersion {
    
    id?: number;

    versionNumber: string;
    fileName: string;
    latestVersion: boolean;
    companyId: number;
    releaseNote: string;
    releaseDate: Date;

    apkDownloadUrl?: string;

}
