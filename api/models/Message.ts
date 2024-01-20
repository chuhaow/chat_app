import mongoose, {Document, Schema, Types} from "mongoose";

interface IMessage extends Document{
    sender: Types.ObjectId;
    recipient: Types.ObjectId;
    text: string;
}

const MessageSchema = new mongoose.Schema({
    sender: {type: Types.ObjectId, ref: 'User'},
    recipient: {type: Types.ObjectId, ref: 'User'},
    text: {type: String},
}, {timestamps:true})

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;