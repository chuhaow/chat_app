import IFile from "./IFile";

export default interface IMessage {
    _id: string;
    text: string;
    sender: string;
    recipient: string;
    file: IFile | null | string
  }