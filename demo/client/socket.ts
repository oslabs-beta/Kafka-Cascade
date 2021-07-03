const wsURL = 'ws://localhost:4000/';

class Socket {
  socket:WebSocket;
  connected:boolean;
  nextId:number;
  listeners: { id:number, callback:(type:string, payload:any, id:number) => void}[];
  connect: () => Promise<any>;

  constructor() {
    this.connect = () => {
      this.socket = new WebSocket(wsURL);          

      this.socket.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        this.listeners.forEach(l => l.callback(msg.type, msg.data, l.id));
      }

      return new Promise((resolve, reject) => {
        this.socket.onopen = (e) => {
          this.connected = true;
          resolve(true);
        };
      });
    }

    this.listeners = [];
    this.nextId = 0;
    this.connected = false;
  }

  addListener(callback) {
    this.listeners.push({ id:this.nextId, callback});
    return this.nextId++;
  }

  removeListener(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  sendEvent(type, data) {
    this.socket.send(JSON.stringify({type, data}));
  }
}

const socket = new Socket();

export default socket;