import IFile from "./IFile";

export default interface IMessage {
    _id: string;
    text: string;
    sender: string | null;
    recipient: string | null;
    file: IFile | null
  }