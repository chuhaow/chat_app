import { Request, Response } from 'express';
import MessageModel from '../models/Message';
import { IUserdata } from '../interfaces/IUserdata';
import { getUserDataFromRequest } from '../helpers/jwtHelper';
import UserModel from '../models/User';

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

export async function clearUnreadMessages(req: Request, res: Response): Promise<void>{
  try {
    const { userId, selectedChatId } = req.body;

    if (userId && selectedChatId) {
      // Clear the unread message count for the specified other user
      await UserModel.updateOne(
        { _id: userId },
        { $set: { [`unreadMessageCounts.${selectedChatId}`]: 0 } }
      );
      
      res.status(200).json({ message: 'Unread messages cleared successfully' });
    } else {
      res.status(400).json({ message: 'Both myId and otherId are required in the request body' });
    }
  } catch (error) {
    console.error('Error clearing unread messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUnreadMessagesById(req: Request, res: Response): Promise<void> {
  try {
    const { userId, selectedChatId } = req.params;
    console.log(req.params)
    if (!userId || !selectedChatId) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const unreadCount = user.unreadMessageCounts[selectedChatId] || 0;

    res.json({ unreadCount });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}
}