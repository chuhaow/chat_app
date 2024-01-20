import { useEffect, useRef } from "react";
import IMessage from "../Interfaces/IMessage";
import IOnlineMessage from "../Interfaces/IOnlineMessage";

interface WebSocketManagerProps {
  onMessageReceived: (message: IMessage | IOnlineMessage) => void;
}

type WebSocketMessage = IMessage | IOnlineMessage;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private onMessageReceived: (message: IMessage | IOnlineMessage) => void;

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
      const messageData: WebSocketMessage = JSON.parse(e.data);
      this.onMessageReceived(messageData);
    } catch (error) {
      console.error("Error parsing message: ", error);
    }
  };

  sendMessage(message: IMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket connection is not open. Message not sent.");
    }
  }

  cleanup() {
    this.ws?.close();
  }
}

export default WebSocketManager;