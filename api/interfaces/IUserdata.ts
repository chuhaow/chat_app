import { JwtPayload } from "jsonwebtoken";

export interface IUserdata extends JwtPayload{
    _id: string;
    username: string;
    iat: number;
}