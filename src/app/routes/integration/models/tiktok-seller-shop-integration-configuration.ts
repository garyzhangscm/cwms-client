export interface TiktokSellerShopIntegrationConfiguration {
    id: number;
 

    authCode: string;

    companyId: number;
    clientId?: number;

    accessToken: string;
    accessTokenExpireIn: number;
    refreshToken: string;
    refreshTokenExpireIn: number;
    
    openId: string;
    sellerName: string;
    sellerBaseRegion: string;
    userType: number;
    autoRefreshOrderTimeWindowInMinute?: number;
}
