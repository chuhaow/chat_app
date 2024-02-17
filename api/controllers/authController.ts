import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/User';
import { IUserdata } from '../interfaces/IUserdata';
import {generateToken,getUserDataFromRequest } from '../helpers/jwtHelper';


const jwtSecret = process.env.JWT_SECRET || '';
const salt = bcrypt.genSaltSync(10);

export async function registerUser(req: Request, res: Response): Promise<void>  {
    try {
      const { username, password } = req.body;
      const hashPassword = bcrypt.hashSync(password, salt)
  
      try {
        const createdUser: IUser = await UserModel.create({ 
          username: username, 
          password: hashPassword
        });
  
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, (err:any, token:string | undefined) => {
          if (err) throw err;
          res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
            _id: createdUser._id,
          });
        });
      } catch (error) {
          if(error instanceof Error && (error as any).code === 11000){
            res.status(400).json({error: "Username already exists"})
          }else{
            throw error;
          }
      }
  
  
    } catch (error) {
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  };
  
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const foundUser = await UserModel.findOne({ username });

    if (foundUser) {
      const isPassCorrect = bcrypt.compareSync(password, foundUser.password);

      if (isPassCorrect) {
        const token = generateToken(foundUser._id, foundUser.username);

        res.cookie('token', token, { sameSite: 'none', secure: true }).json({ id: foundUser._id });
      } else {
        res.status(401).json({ error: 'Password is incorrect' });
      }
    } else {
      res.status(400).json({ error: 'User is not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

  
export function logoutUser(req: Request, res: Response): void {
  res.clearCookie('token', { sameSite: 'none', secure: true }).json('ok');
}

  
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const userData: IUserdata = await getUserDataFromRequest(req);

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}