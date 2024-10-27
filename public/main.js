import { ChatContainer, ChatMessage, showAlert } from './components/message.js';
import { Counter, compareObjects, replaceVariables, logger } from './utils/utils.js';
import { handleleermensaje } from './audio/tts.js';
import { Replacetextoread } from './features/speechconfig.js';
import { ActionsManager } from './features/Actions.js';
import { EventsManager } from './features/Events.js';
import { sendcommandmc } from './features/Minecraftconfig.js';
const socket = io();
const userProfile = document.querySelector('user-profile');
console.log(userProfile.state);
userProfile.setConnectionStatus('offline');
if (userProfile.state.connected) {
    userProfile.setConnectionStatus('away');
    joinRoom(userProfile.state.username);
}
// Escuchar eventos
userProfile.addEventListener('userConnected', (e) => {
    console.log('Usuario conectado:', e.detail.username, e);
    userProfile.setConnectionStatus('away');
    joinRoom(e.detail.username);
  }); 

userProfile.addEventListener('userDisconnected', (e) => {
    console.log('Usuario desconectado',e);
});
function joinRoom(roomid) {
    const roomId = roomid || document.getElementById('roomId').value;
    socket.emit('joinRoom', { uniqueId: roomId });
}
const events = ['chat', 'gift', 'connected', 'disconnected',
    'websocketConnected', 'error', 'member', 'roomUser',
    'like', 'social', 'emote', 'envelope', 'questionNew',
    'subscribe', 'follow', 'share', 'streamEnd'];
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
        localStorage.setItem('last'+event, JSON.stringify(data));
        switch (event) {
            case 'member':
                HandleAccionEvent('welcome',data)
                handlemember(data);
                break;
            case 'chat':
                handlechat(data);
                HandleAccionEvent(event,data)
                break;
            case 'gift':
                handlegift(data);
                HandleAccionEvent(event,data)
                break;
            case 'like':
                handlelike(data);
                HandleAccionEvent(event,data)
                break;
            case 'connected':
                userProfile.setConnectionStatus('online');
                if (data.roomInfo?.owner) localStorage.setItem('ownerdata',JSON.stringify(data.roomInfo.owner));
                const lastownerdata = localStorage.getItem('ownerdata');
                if (lastownerdata) userProfile.setProfileImage(getAvatarUrl(JSON.parse(lastownerdata)));
                console.log(event, data);
                showAlert('success', `Connected`);
                break;
            case 'streamEnd':
            case 'disconnected':
            case 'error':
                userProfile.setConnectionStatus('offline');
                showAlert('error', `${event}`);
                console.log(event, data);
                break;
            default:
                HandleAccionEvent(event,data) 
                console.log(event, data);
                //showAlert('success', `Event ${event}`);
                break;  
        }
/*         document.getElementById('lasteventParse').innerHTML = JSON.stringify(data);
 */  });
});
function getAvatarUrl(avatarData, preferredSize = 'large') {
  // Mapeo de nombres de tamaños a keys del objeto
  const sizeMap = {
      'large': 'avatar_large',
      'medium': 'avatar_medium',
      'thumb': 'avatar_thumb'
  };

  // Orden de fallback para los tamaños
  const sizeOrder = ['large', 'medium', 'thumb'];
  
  // Si se proporciona un tamaño preferido, reordenar para intentar ese primero
  if (preferredSize && sizeOrder.includes(preferredSize)) {
      const index = sizeOrder.indexOf(preferredSize);
      sizeOrder.unshift(...sizeOrder.splice(index, 1));
  }

  // Intentar obtener URL del tamaño preferido, con fallback a otros tamaños
  for (const size of sizeOrder) {
      const avatarKey = sizeMap[size];
      const avatarInfo = avatarData[avatarKey];

      if (avatarInfo && 
          avatarInfo.url_list && 
          Array.isArray(avatarInfo.url_list) && 
          avatarInfo.url_list.length > 0) {
          // Preferir WebP si está disponible
          const webpUrl = avatarInfo.url_list.find(url => url.endsWith('.webp'));
          return webpUrl || avatarInfo.url_list[0];
      }
  }

  return ''; // Retornar string vacío si no se encuentra ninguna URL
}
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
const arrayevents = ["like", "gift", "chat"];

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
function handlemember(data) {
    //eventype member = welcome
    const parsedmemberdata = {
      content: {
        1: ["url", `http://tiktok.com/@${data.uniqueId}`,"blue",`${data.nickname}`],
        2: ["text", 'welcome',"gold"],
        // 3: ["text", "!","gold"],
      },
      comment: '',
    };
    const newMessage = new ChatMessage( `msg${counterchat.increment()}`, data.profilePictureUrl, parsedmemberdata);
    newEventsContainer.addMessage(newMessage);
}
function handlelike(data) {
    const parsedlikedata = {
      content: {
        1: ["url", `http://tiktok.com/@${data.uniqueId}`,"blue",`${data.nickname}`],
        2: ["text", data.likeCount,"gold"],
        3: ["text", "likes","white"],
      },
      comment: '',
    };
    const newMessage = new ChatMessage( `msg${counterchat.increment()}`, data.profilePictureUrl, parsedlikedata);
    newEventsContainer.addMessage(newMessage);
}
function Readtext(eventType = 'chat',data) {
  // especial case if roomuser is welcome
  if (eventType === 'member') eventType = 'welcome';
  Replacetextoread(eventType, data);
}
const generateobject = (eventType,comparison ) => {
  return arrayevents.includes(eventType) 
    ? [{ key: eventType, compare: comparison },{ key: 'eventType', compare: 'isEqual' }] 
    : [{ key: 'eventType', compare: 'isEqual' }]
};
async function HandleAccionEvent(eventType,data,comparison = 'isEqual') {
  const keysToCheck = generateobject(eventType,comparison)
  const callbackFunction = (matchingObject, index, results) => {
    console.log(`Objeto coincidente encontrado en el índice ${index}:`, matchingObject, results);
  };
  const results = compareObjects(data, await EventsManager.getAllData(), keysToCheck, callbackFunction);
  logger.log('debug',"results HandleAccionEvent",results)
  if (results.validResults.length >= 1 ) {
    results.validResults.forEach(result => {
      processAction(result,data)
    });
  }
}
function processAction(data,userdata) {
  console.log("procesar accion",data)
  if (data.Actions.length > 0) {
    data.Actions.forEach(action => {
      Actionsprocessmanager(action,userdata)
    });
  }
}
const processActioncallbacks = {
  minecraft: (data,userdata) => handleMinecraft(data,userdata),
  tts: (data,userdata) => handletts(data,userdata),
}
async function Actionsprocessmanager(id,userdata) {
  console.log("accionesprocessmanager",id)
  const action = await ActionsManager.getDataById(id)
  console.log("accionesprocessmanager",action)
  if (action) {
    Object.keys(processActioncallbacks).forEach(key => {
      if (action[key]) {
        processActioncallbacks[key](action[key],userdata)
      }
    });
  }
}
function handleMinecraft(data,userdata) {
  if (data?.check) {
    console.log("minecraft check",data)
    const replacecommand = replaceVariables(data.command,userdata);
    console.log("replacecommand",replacecommand)
    sendcommandmc(replacecommand);
  } else {
    console.log("minecraft no check",data)
  }
}
function handletts(data,userdata) {
  if (data?.check) {
    console.log("tts check",data)
    const replacecommand = replaceVariables(data.text,userdata);
    console.log("replacecommand",replacecommand)
    handleleermensaje(replacecommand);
  } else {
    console.log("tts no check",data)
  }
}
// setTimeout(() => {
//   HandleAccionEvent('chat',{nombre: "coloca tu nombre",eventType: "chat",chat: "default text",like: 10,gift: 5655,Actions: [],id: undefined})
// }, 1000);