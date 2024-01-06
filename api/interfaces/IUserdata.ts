import { JwtPayload } from "jsonwebtoken";

export interface IUserdata extends JwtPayload{
    userId: string;
    username: string;
    iat: number;
}