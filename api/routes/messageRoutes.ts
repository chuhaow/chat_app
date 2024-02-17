import express, {Request, Response} from 'express'
import { getMessageHistory } from '../controllers/messageController';

const router = express.Router();

router.get('/history/:userId', getMessageHistory); 
  
export default router;