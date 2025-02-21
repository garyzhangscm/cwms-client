 
import { User } from "../../auth/models/user";
import { Alert } from "./alert";

export interface WebMessageAlert {
    id: number;

    alert: Alert;
    user: User;


    readFlag: boolean;


    readDate: Date;
}
