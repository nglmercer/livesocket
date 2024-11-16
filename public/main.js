import { Counter, compareObjects, replaceVariables, logger, UserInteractionTracker, EvaluerLikes } from './utils/utils.js';
import { ChatContainer, ChatMessage, showAlert } from './components/message.js';
import { Replacetextoread, addfilterword, existuserinArray } from './features/speechconfig.js';
import { handleleermensaje } from './audio/tts.js';
import { getTranslation, translations } from './translations.js';
import { ActionsManager } from './features/Actions.js';
import { EventsManager } from './features/Events.js';
import { sendcommandmc } from './features/Minecraftconfig.js';
const socket = io();
const userProfile = document.querySelector('user-profile');
console.log(userProfile.state);
userProfile.setConnectionStatus('offline');

// Escuchar eventos
userProfile.addEventListener('userConnected', (e) => {
    console.log('Usuario conectado:', e.detail.username, e);
    userProfile.setConnectionStatus('away');
    joinRoom(e.detail.username);
  }); 

userProfile.addEventListener('userDisconnected', (e) => {
    console.log('Usuario desconectado' ,e);
});
function joinRoom(roomid) {
    const roomId = roomid || document.getElementById('roomId').value;
    socket.emit('joinRoom', { uniqueId: roomId });
}
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
class GetAvatarUrlKick {
  static async getInformation(username) {
      const API = `https://kick.com/api/v1/users/${username}`;
      
      // Verificar si los datos ya están almacenados y coinciden con el usuario
      if (localStorage.getItem("Lastuserinfo") && localStorage.getItem("Lastusername") === username) {
          return JSON.parse(localStorage.getItem("Lastuserinfo"));
      }

      try {
          const response = await fetch(API, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              throw new Error(`Error al obtener datos: ${response.statusText}`);
          }

          const jsonObject = await response.json();
          
          // Guardar los datos una vez resueltos en localStorage
          localStorage.setItem("Lastusername", username); // Guardar el nombre de usuario sin JSON.stringify
          localStorage.setItem("Lastuserinfo", JSON.stringify(jsonObject));

          console.log('JSON Object:', jsonObject);
          return jsonObject;

      } catch (error) {
          console.error('Error al obtener la información:', error);
      }
  }

  static async getProfilePic(username) {
      // Obtener la información y luego devolver el campo "profilepic"
      const userInfo = await GetAvatarUrlKick.getInformation(username);
      return userInfo ? userInfo.profilepic : null;
  }
}

if (userProfile.state.connected) {
  const trackerMultiple = new UserInteractionTracker();
  trackerMultiple.addInteractionListener(async event => {
    try {
    const interacted = trackerMultiple.getAllInteractionsByArray([
      'click', 
      'touchstart', 
      'keydown',
    ]);
    
    
    if (interacted) {
      console.log('Usuario ha interactuado se conectara');
      joinRoom(userProfile.state.username);
      trackerMultiple.destroy()
    }
    userProfile.setProfileImage(await GetAvatarUrlKick.getProfilePic(userProfile.state.username));
  } catch (error) {
    console.error('Error al detectar interacción:', error);
  }
  });
  
    userProfile.setConnectionStatus('away');
}
const events = ['ready', 'ChatMessage', 'Subscription', 'disconnected', 'error', 'allromuser'];
const counterchat = new Counter(0, 1000);
const countergift = new Counter(0, 1000);
const countershare = new Counter(0, 1000);
const counterlike = new Counter(0, 1000);
const counterfollow = new Counter(0, 1000);
const countermember = new Counter(0, 1000);
const newChatContainer = new ChatContainer('.chatcontainer', 500);
const newGiftContainer = new ChatContainer('.giftcontainer', 500);
const newEventsContainer = new ChatContainer('.eventscontainer', 200); 
const containerConfig = {
  chat: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.chatcontainer', 500)
  },
  gift: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.giftcontainer', 500)
  },
  share: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  like: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  follow: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  },
  member: {
    counter: new Counter(0, 1000),
    container: new ChatContainer('.eventscontainer', 200)
  }
};   
events.forEach(event => {
    socket.on(event, async (data) => {
      //Readtext(event, data);
        localStorage.setItem('last'+event, JSON.stringify(data));
        //console.log("event",event,data)
        switch (event) {
            case 'ready':
                userProfile.setProfileImage(await GetAvatarUrlKick.getProfilePic(data.username));
                break;
            case 'ChatMessage':
                const newdata = await mapChatMessagetochat(data);
                HandleAccionEvent('chat',newdata)
                handlechat(newdata);
                Readtext('chat',newdata);
                break;
            default:
              console.log("event",event,data)
                break;
        }
/*         document.getElementById('lasteventParse').innerHTML = JSON.stringify(data);
 */  });
});

async function mapChatMessagetochat(data) {
  return {
    comment: data.content,
    type: data.type,
    uniqueId: data.sender?.username,
    nickname: data.sender?.slug,
    color: data.sender?.indentity?.color,
    profilePictureUrl: await GetAvatarUrlKick.getProfilePic(data.sender?.username),
  }
}
/* const textcontent = {
    content: {
      1: ["text", getTranslation('username'),"white"],
      2: ["text", "uniqueId","silver"],
      3: ["text", "comentario = ","gold"],
      4: ["text", "comment","gold"],
      // 4: ["url", "https://example.com", "blue", "Click para ir a mi perfil"]
  
    },
    comment: "texto de prueba123123123",
    // data: {
    //   comment: "texto de prueba123123123",
    //   number: 123,
    //   text: "text",
    // }
  } */
const newtextcontent = {
  user: {
    name: "username",
    value: "uniqueId comment",
  },
  content: [
    { type: 'text', value: "uniqueId = username" },
    { type: 'text', value: "comentario = comment" },
  ],
}
/* const numbercontent = {
  content: {
    1: ["text", getTranslation('username'),"white"],
    2: ["text", "uniqueId","silver"],
    3: ["number", 1,"gold"],
    4: ["text", "= repeatCount","gold"],
    5: ["text", "giftname = rose","cyan"],
  },
  data: {
    number: 123,
    text: "text",
  }
} */
const newnumbercontent = {
  user: {
    name: "username",
    value: "texto de prueba123123123",
  },
  content: [
    { type: 'text', value: "UniqueId" },
    { type: 'text', value: "1 = repeatCount" },
    { type: 'text', value: "rose = giftname" },
  ],
}
/* const eventcontent = {
  content: {
    1: ["text", "UniqueId","white"],
    2: ["text", getTranslation('followed'),"yellow"],
  },
  data: {
    number: 123,
    text: "text",
  }
} */
const neweventcontent = {
  user: {
    name: "username",
    value: "UniqueId",
  },
  content: [
    { type: 'text', value: "UniqueId" },
    { type: 'text', value: getTranslation('followed') },
  ],
}
const splitfilterwords = (data) => {
  console.log("Callback 1 ejecutado:", data);
  if (data?.comment) {
    const comments = data.comment.match(/.{1,10}/g) || [];
    console.log("comments", comments);
    comments.forEach(comment => {
      if (comment.length < 6) return;
      addfilterword(comment);
    });
  }
};
const filterwordadd = (data) => {
  console.log("Callback 2 ejecutado:", data);
  if (data?.comment && data?.comment.length > 6) {
    addfilterword(data.comment);
  }
}
//const callbacksmessage = [splitfilterwords,filterwordadd];
//const optionTexts = ['filtrar comentarios - dividir', 'filtrar comentario'];
//const message1 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', textcontent, callbacksmessage,optionTexts);
//const message2 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', numbercontent);
//const message3 = new ChatMessage( `msg${counterchat.increment()}`, 'https://cdn-icons-png.flaticon.com/128/6422/6422200.png', eventcontent);
// Crear callbacks
//newChatContainer.addMessage(message1);
//newGiftContainer.addMessage(message2);
//newEventsContainer.addMessage(message3);
const defaultmenuchat = [
  {
    text: 'filtrar comentarios - dividir',
    callback: (messageData) => {
      console.log('Responder clicked', messageData);
      const { user, content } = messageData;
      const { name, value } = user;
      console.log('Responder clicked', user, content);
      // splitfilterwords(value);
    }
  },
  {
    text: 'filtrar comentario',
    callback: (messageData) => {
      console.log('Responder clicked', messageData);
      const { user, content } = messageData;
      const { name, value } = user;
      console.log('Responder clicked', user, content);
      // filterwordadd(value);
    }
  },
  {
    text: 'Bloquear usuario',
    callback: (messageData) => {
      console.log('Responder clicked', messageData);
      const { user, content } = messageData;
      const { name, value } = user;
      console.log('Responder clicked', user, content);
      // create functio to block user example blockuser(name);
    }
  }
];
const giftmenu = [
  {
    text: 'Responder',
    callback: (messageData) => {
      console.log('Responder clicked', messageData);
    }
  }
]
const timenow = () => {
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  return timeString;
}
async function lastelement(){
  const messagedata = JSON.parse(localStorage.getItem('lastChatMessage'));
  const newdata = await mapChatMessagetochat(messagedata);
  HandleAccionEvent('chat',newdata)
  console.log("mapChatMessagetochat",newdata)

  const newwebcomponentchat = webcomponentchat(newdata,defaultmenuchat,{type:"text",value:timenow()});
  const newmessage1 = webcomponenttemplate(newtextcontent);
  const newmessage2 = webcomponenttemplate(newnumbercontent,giftmenu);
  const newmessage3 = webcomponenttemplate(neweventcontent,giftmenu);
  
  appendmessage2(newwebcomponentchat,"chatcontainer");
  appendmessage2(newmessage1,"chatcontainer");
  appendmessage2(newmessage2,"giftcontainer");
  appendmessage2(newmessage3,"eventscontainer");

/* function returnchatelement(data) {
  const elementwebcomponent = document.createElement('chat-message');
  elementwebcomponent.setMessageData(data);
  return elementwebcomponent;
} */
}
lastelement();

function appendmessage(data,container) {
  const elementwebcomponent = document.createElement('chat-message');
  elementwebcomponent.setMessageData(data);

  const elementcontainer = document.getElementById(container);
  elementcontainer.appendChild(elementwebcomponent);
}
function appendmessage2(data,container) {
  const elementwebcomponent = document.getElementById(container);
  elementwebcomponent.addMessage(data);
}
const arrayevents = ["like", "gift", "chat"];

// Funciones de manejo específicas
const handlechat = async (data) => {
  const newhtml = webcomponentchat(data,defaultmenuchat,{type:"text",value:timenow()});
  appendmessage2(newhtml,"chatcontainer");
}
function webcomponentchat(data,optionmenuchat = defaultmenuchat,additionaldata = {}) {
  return {
    user: {
      name: data.uniqueId,
      photo: data.profilePictureUrl,
      value: data.comment,
      data: data,
    },
    content: [
      { type: 'text', value: data.uniqueId },
      { type: 'text', value: data.comment },
      additionaldata
    //  { type: 'image', value: data.profilePictureUrl }
    ],
    menu: {
      options: optionmenuchat
    }
  };
}
function webcomponenttemplate(template = {}, optionmenuchat = defaultmenuchat, newdata = {},additionaldata={}){
  if (template && template.user && template.content && template.content.length > 0) {
    return { ...template, menu: {options: optionmenuchat}};
  }
  return {
    user : newdata,
    content: [
      { type: 'text', value: data.comment },
      additionaldata
    //  { type: 'image', value: data.profilePictureUrl }
    ],
    menu: {
      options: optionmenuchat
    }
  };
}
let lastcomment = ''
function Readtext(eventType = 'chat',data) {
  // especial case if roomuser is welcome
  if (data.uniqueId && existuserinArray(data.uniqueId)) { showAlert('info',`${getTranslation('blacklistuser')} ${data.uniqueId} `); return; }
  if (eventType === 'member') eventType = 'welcome';
  if (eventType === 'chat') {
    const removeHttpLinksRegex = (text) => {
      return text.replace(/(?:^|\s)https?:\/\/\S+/gi, ' link').trim();
  };  
    data.comment = removeHttpLinksRegex(data.comment);
    console.log("data.comment",data.comment,removeHttpLinksRegex(data.comment));
    if(data.comment === lastcomment) {
      return;
    } 
    lastcomment = data.comment;
  }
  Replacetextoread(eventType, data);
}
//Readtext('chat',{uniqueId:"nightbot",comment:"hola  https://www.google.com mira esto"});
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
  console.log('debug',"results HandleAccionEvent",results)
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