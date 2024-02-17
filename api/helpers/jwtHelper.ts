import { IUserdata } from "../interfaces/IUserdata";
import jwt from 'jsonwebtoken';
import { Request } from "express";

const jwtSecret = process.env.JWT_SECRET || '';

export function generateToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, jwtSecret, { expiresIn: '1h' });
}

export async function getUserDataFromRequest(req:Request): Promise<IUserdata>{
    return new Promise( (resolve, reject) =>{
      const {cookies} = req;
      if(cookies && cookies.token){
        jwt.verify(cookies.token, jwtSecret, {}, (err: jwt.VerifyErrors | null, userdata: string | jwt.JwtPayload | undefined) =>{
          if(err) reject(err);
  
          resolve(userdata as IUserdata)
        })
      }else{
        reject("no token")
      }
    })
      
  }