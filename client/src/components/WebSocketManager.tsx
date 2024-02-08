import { useEffect, useRef } from "react";
import IMessage from "../Interfaces/IMessage";
import IOnlineMessage from "../Interfaces/IOnlineMessage";
import IServerMessageData from "../Interfaces/IServerMessageData";

interface WebSocketManagerProps {
  onMessageReceived: (message: IServerMessageData | IOnlineMessage) => void;
}

type WebSocketMessage = IServerMessageData | IOnlineMessage;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private onMessageReceived: (message: IServerMessageData | IOnlineMessage) => void;

  constructor(props: WebSocketManagerProps) {
    this.onMessageReceived = props.onMessageReceived;
    this.connectToWs();
  }

  private connectToWs() {
    this.ws = new WebSocket("ws://localhost:4000");

    this.ws.addEventListener("open", () => {
      console.log("WebSocket connection opened");
    });

    this.ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, trying to reconnect...");
        this.connectToWs();
      }, 1000);
    });

    this.ws.addEventListener("message", this.handleMessage);
  }

  private handleMessage = (e: MessageEvent) => {
    try {
      //console.log(e.data);
      if(e.data === 'ping'){
        this.ws?.send('pong');
        return;
      }else{
        const messageData: WebSocketMessage = JSON.parse(e.data);
        console.log("Got a message")
        this.onMessageReceived(messageData);
      }

    } catch (error) {
      console.error("Error parsing message: ", error);
    }
  };

  sendMessage(message: IMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log("Message sent")
    } else {
      console.error("WebSocket connection is not open. Message not sent.");
    }
  }

  cleanup() {
    this.ws?.close();
  }
}

export default WebSocketManager;