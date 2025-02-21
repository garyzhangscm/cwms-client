export interface QuickbookOnlineConfiguration {
    warehouseId: number;
    companyId: number;
    clientId?: string;

    clientSecret?: string;

    webhookVerifierToken?: string;

    quickbookOnlineUrl?: string;
}
