import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document{
    username: string;
    password: string;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    username: { type: String, unique: true },
    password: String,
  },
  { timestamps: true }
);
const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;