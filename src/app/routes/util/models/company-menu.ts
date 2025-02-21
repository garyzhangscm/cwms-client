import { Menu } from "../../auth/models/menu";
 

export interface CompanyMenu {
    id: number;
    companyId: number;
    menu: Menu;
}
