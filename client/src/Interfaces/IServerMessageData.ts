export default interface IServerMessageData {
    _id: string;
    text: string;
    sender: string;
    recipient: string;
    filename: string | null
}