interface IFile{
    info: string;
    data: string | ArrayBuffer | null
}
export interface IMessageData
{
    _id: string;
    text: string;
    sender: string | null;
    recipient: string | null;
    file: IFile
}