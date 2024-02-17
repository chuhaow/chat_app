import { Request, Response } from 'express';
import MessageModel from '../models/Message';
import { IUserdata } from '../interfaces/IUserdata';
import { getUserDataFromRequest } from '../helpers/jwtHelper';

export async function getMessageHistory(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const userData: IUserdata = await getUserDataFromRequest(req);
    const myUserId = userData.userId;

    const messages = await MessageModel.find({
      sender: { $in: [userId, myUserId] },
      recipient: { $in: [userId, myUserId] }
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
