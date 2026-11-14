export interface ShopifyIntegrationConfiguration {
    id: number;
   
    companyId: number;
    clientId?: number; 
    
    shop: string; 
    access_token: string;
    scope: string; 
}
