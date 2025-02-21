import { Client } from "../../common/models/client";
import { Role } from "./role";

export interface RoleClientAccess {
    id?: number;


    role?: Role;

    clientId: number;

    client?: Client;
}
