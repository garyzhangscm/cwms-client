export interface QuickbookOnlineToken {
    realmId?: string;

    authorizationCode?: string;

    token?: string;

    refreshToken?: string;


    lastTokenRequestTime?: Date;
    lastCDCCallTime?: Date;

}
