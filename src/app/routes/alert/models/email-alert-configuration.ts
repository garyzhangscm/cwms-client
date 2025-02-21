export interface EmailAlertConfiguration {
    
    id?: number;

    companyId: number;

    host: string;
    port: number;

    username: string;
    password: string;

    sendFromEmail: string;

    transportProtocol: string;
    authFlag: boolean;
    starttlsEnableFlag: boolean;
    debugFlag: boolean;
}
