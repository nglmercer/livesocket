import DynamicTable, { EditModal } from '../components/renderfields.js';
const minecraftconfig = {
    ip: {
      class: 'input-default',
      type: 'text',
      returnType: 'string',
    },
    port: {
      class: 'input-default',
      type: 'number',
      returnType: 'number',
    },
    username: {
      class: 'input-default',
      type: 'text',
      returnType: 'string',
    },
    password: {
      class: 'input-default',
      type: 'password',
      returnType: 'string',
    }
  }
  const minecraftdata = {
    ip: "localhost",
    port: 4567,
    username: "nglmercer",
    password: "change_me",
  }
  const minecraftcallback = async (data,modifiedData) => {
    console.log("minecraftcallback",data,modifiedData);
    }
    const deletecallback =  async (data,modifiedData) => {
      console.log("deletecallback",data,modifiedData);
    }
    const callbackconfig = {
      callback: minecraftcallback,
      deletecallback:  deletecallback,
      callbacktext: 'Guardar cambios',
      deletecallbacktext: 'cerrar',
    }
    const Aformelement = new EditModal('#MinecraftModalContainer',callbackconfig,minecraftconfig);
    Aformelement.render(minecraftdata);
  if (localStorage.getItem("MinecraftPluginServer")) {
    const data = JSON.parse(localStorage.getItem("MinecraftPluginServer"));
    console.log("MinecraftPluginServer", data);
    handlebotconnect("connect-plugin",data);
    setTimeout(function () {
      handlebotconnect("connect-plugin",data);
    }, 1000);
  }
//   document.getElementById('sendcommandmc').addEventListener('submit', function(e) {
//     e.preventDefault();
//     const data = Object.fromEntries(new FormData(e.target).entries());
//     sendcommandmc(data.commandinput);
//   });
  
  function handlebotconnect(eventType,data) {
    switch (eventType) {
      // case "connect-bot":
      //   socketManager.emitMessage(eventType,data);
      //   break;
      // case "connect-rcon":
      //   socketManager.emitMessage(eventType,data);
      //   break;
      case "connect-plugin":
        pluginconnect(data);
        break;
      default:
          console.log(`Tipo de evento desconocido: ${eventType}`,data);
    }
  }
  class WebSocketManager {
    constructor(maxReconnectAttempts = 10, reconnectInterval = 1000) {
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.reconnectInterval = reconnectInterval;
        this.reconnectAttempts = 0;
        this.ws = null;
    }
  
    connect(wsurl,password) {
        this.ws = new WebSocket(wsurl);
        document.cookie = password ||"x-servertap-key=change_me";
  
        this.ws.onopen = () => {
            console.log('Opened connection');
            this.ws.send(`/say conectado `);
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };
  
        this.ws.onmessage = (event) => {
            // console.log('Message from server:', event.data);
            // document.getElementById('output').innerText += '\n' + event.data.replace(/\n/g, '<br>');
        };
  
        this.ws.onerror = (error) => {
            console.log('WebSocket Error:', error);
        };
  
        this.ws.onclose = () => {
            console.log('Closed connection');
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,wsurl);
                setTimeout(() => this.connect(wsurl), this.reconnectInterval);
            } else {
                console.log('Max reconnect attempts reached. Giving up.');
            }
        };
    }
  
    async sendCommand(command) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(command);
            console.log("Command sent:", command);
        } else {
            await this.waitForConnection();
            this.ws.send(command);
            console.log("Command sent after reconnecting:", command);
        }
    }
  
    async waitForConnection() {
        while (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
  }
  const ws = new WebSocketManager();
  function sendcommandmc(command) {
      ws.sendCommand(command);
      console.log("sendcommandmc", command);
  }
  function pluginconnect(data) {
    let defaultOptions = {
      host: data.host || "localhost",
      port: data.port || 4567,
      password: data.password || "change_me",
    }
    const wsurl = `ws://${defaultOptions.host}:${defaultOptions.port}/v1/ws/console`;
    setTimeout(() => {
      ws.connect(wsurl, defaultOptions.password);
      ws.sendCommand(`/say conectado `);
    }, 1000);
  }