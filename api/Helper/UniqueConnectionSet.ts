import { IConnectionData } from "../interfaces/IConnectionData";

class UniqueConnectionSet {
    private connectionsMap: Map<string, IConnectionData & WebSocket>;
  
    constructor() {
      this.connectionsMap = new Map();
    }
  
    add(connection: IConnectionData & WebSocket) {
      this.connectionsMap.set(connection._id, connection);
    }
  
    delete(connection: IConnectionData & WebSocket) {
      this.connectionsMap.delete(connection._id);
    }
  
    forEach(callbackfn: (value: IConnectionData & WebSocket, key: string, map: Map<string, IConnectionData & WebSocket>) => void) {
        this.connectionsMap.forEach(callbackfn);
    }
  
    get size(): number {
      return this.connectionsMap.size;
    }
  
    clear() {
      this.connectionsMap.clear();
    }

    *[Symbol.iterator](): IterableIterator<IConnectionData & WebSocket> {
        for (const [, value] of this.connectionsMap) {
          yield value;
        }
    }
  }
  
export default UniqueConnectionSet