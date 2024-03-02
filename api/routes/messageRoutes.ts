import express, {Request, Response} from 'express'
import { clearUnreadMessages, getMessageHistory, getUnreadMessagesById } from '../controllers/messageController';

const router = express.Router();

router.get('/history/:userId', getMessageHistory); 
router.post('/clearUnreadMessages', clearUnreadMessages)
router.get('/unreadMessageCount/:userId/:selectedChatId', getUnreadMessagesById)
  
export default router;