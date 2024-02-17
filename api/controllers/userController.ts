import { Request, Response } from 'express';
import UserModel from '../models/User';

// Controller for fetching all users
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await UserModel.find({}, { _id: 1, username: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Controller for fetching a specific user by ID
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
