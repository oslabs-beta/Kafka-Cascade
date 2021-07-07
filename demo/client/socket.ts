const wsURL = 'ws://localhost:4000/';

class Socket {
  socket:WebSocket;
  connected:boolean;
  nextId:number;
  listeners: {[details: string] : { id:number, callback:(payload:any, id:number) => void}[]};
  connect: () => Promise<any>;

  constructor() {
    this.connect = () => {
      this.socket = new WebSocket(wsURL);          

      this.socket.onmessage = (e) => {
        console.log('Received message: ', e);
        const msg = JSON.parse(e.data);
        this.listeners[msg.type].forEach(l => l.callback(msg.payload, l.id));
      }

      return new Promise((resolve, reject) => {
        this.socket.onopen = (e) => {
          this.connected = true;
          resolve(true);
        };
      });
    }

    this.listeners = {};
    this.nextId = 0;
    this.connected = false;
  }

  addListener(type:string, callback: (payload:any, id:number) => void) {
    if(!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push({ id:this.nextId, callback});
    return this.nextId++;
  }

  removeListener(id: number) {
    // this.listeners = this.listeners.filter(l => l.id !== id);
  }

  sendEvent(type: string, payload:any = {}) {
    this.socket.send(JSON.stringify({type, payload}));
  }
}

const socket = new Socket();

export default socket;