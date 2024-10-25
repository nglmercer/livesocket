import { ChatContainer, ChatMessage, showAlert } from './components/message.js';
import { Counter } from './utils/utils.js';
import { handleleermensaje } from './audio/tts.js';
import { Replacetextoread } from './features/speechconfig.js';
const socket = io();
document.getElementById('joinRoom').addEventListener('click', joinRoom);
function joinRoom() {
    const roomId = document.getElementById('roomId').value;
    socket.emit('joinRoom', { uniqueId: roomId });
}
const events = ['chat', 'gift', 'connected', 'disconnected',
    'websocketConnected', 'error', 'member', 'roomUser',
    'like', 'social', 'emote', 'envelope', 'questionNew',
    'subscribe', 'follow', 'share'];
const counterchat = new Counter(0, 1000);
const countergift = new Counter(0, 1000);
const countershare = new Counter(0, 1000);
const counterlike = new Counter(0, 1000);
const counterfollow = new Counter(0, 1000);
const countermember = new Counter(0, 1000);
const newChatContainer = new ChatContainer('.chatcontainer', 500);
const newGiftContainer = new ChatContainer('.giftcontainer', 500);
const newEventsContainer = new ChatContainer('.eventscontainer', 200);    
events.forEach(event => {
    socket.on(event, (data) => {
      Readtext(event, data);

        switch (event) {
            case 'chat':
                handlechat(data);
                break;
            case 'gift':
                handlegift(data);
                break;
            case 'connected':
                showAlert('success', `Connected`);
                break;
            case 'disconnected':
                showAlert('error', `Disconnected`);
                break;
            default:
                console.log(event, data);
                //showAlert('success', `Event ${event}`);
                break;  
        }
/*         document.getElementById('lasteventParse').innerHTML = JSON.stringify(data);
 */  });
});

const textcontent = {
    content: {
      1: ["text", "nombre de usuario = ","white"],
      2: ["text", "uniqueId","gold"],
      3: ["text", "comentario = ","white"],
      4: ["text", "comment","gold"],
      // 4: ["url", "https://example.com", "blue", "Click para ir a mi perfil"]
  
    },
    comment: "texto de prueba123123123",
    // data: {
    //   comment: "texto de prueba123123123",
    //   number: 123,
    //   text: "text",
    // }
  }
const numbercontent = {
  content: {
    1: ["text", "nombre de usuario = ","white"],
    2: ["text", "uniqueId","gold"],
    3: ["number", 1,"white"],
    4: ["text", "= repeatCount","gold"],
    5: ["text", "giftname = rose","cyan"],
  },
  data: {
    number: 123,
    text: "text",
  }
}
const eventcontent = {
  content: {
    1: ["text", "UniqueId","white"],
    2: ["text", "te","white"],
    3: ["text", "sigue!","yellow"],
  },
  data: {
    number: 123,
    text: "text",
  }
}
const message1 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', textcontent);
const message2 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', numbercontent);
const message3 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', eventcontent);
// Crear callbacks
newChatContainer.addMessage(message1);
newGiftContainer.addMessage(message2);
newEventsContainer.addMessage(message3);
function handlechat(data) {
    const parsedchatdata = {
      content: {
        1: ["url", `http://tiktok.com/@${data.uniqueId}`,"blue",`${data.nickname}`],
        2: ["text", data.comment,"white"],
        // 3: ["text", "!","gold"],
      },
      comment: data.comment,
    };
    const newMessage = new ChatMessage( `msg${counterchat.increment()}`, data.profilePictureUrl, parsedchatdata);
    newChatContainer.addMessage(newMessage);
    console.log("chat", data);
    showAlert('info', `${data.uniqueId}: ${data.comment}`, 5000);
}
function handlegift(data) {
    console.log("gift", data);
    const parsedgiftdata = {
      content: {
        1: ["url", `http://tiktok.com/@${data.uniqueId}`,"blue",`${data.nickname}`],
        2: ["text", "gifted","white"],
        3: ["number", data.diamondCount,"gold"],
        4: ["text", data.giftName,"gold"],
        5: ["image", data.giftPictureUrl],
      }
    }
    const newMessage = new ChatMessage( `msg${countergift.increment()}`, data.profilePictureUrl, parsedgiftdata);
    newGiftContainer.addMessage(newMessage);
    showAlert('info', `${data.uniqueId} gifted ${data.diamondCount}, ${data.giftName}`, 5000);
  }
function Readtext(eventType = 'chat',data) {
  Replacetextoread(eventType, data);
}