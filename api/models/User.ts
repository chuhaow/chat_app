import mongoose, { Document, Model, Schema } from 'mongoose';

interface UnreadMessageCounts {
  [chatId: string]: number; 
}

export interface IUser extends Document{
    username: string;
    password: string;
    unreadMessageCounts: UnreadMessageCounts;
}


const UserSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, unique: true },
    password: String,
    unreadMessageCounts:{type: Schema.Types.Mixed, default:{}}
  },
  { timestamps: true }
);
const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;