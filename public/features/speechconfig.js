import DynamicTable, { EditModal } from '../components/renderfields.js';
import {replaceVariables} from '../utils/utils.js';
import { leerMensajes, handleleermensaje } from '../audio/tts.js';
const keys = [
    { key: 'chat', text: "uniqueId dice comment", check: true },
    { key: 'gift', text: "uniqueId regalo xrepeatcount giftName", check: true },
    { key: 'follow', text: "uniqueId te ah seguido", check: true },
    { key: 'like', text: "uniqueId le ah dado like", check: false },
    { key: 'share', text: "uniqueId ah compartido", check: false },
    { key: 'subscribe', text: "uniqueId se ah suscrito", check: true },
    { key: 'welcome', text: "bienvenido uniqueId", check: false }
];

const createTTSConfig = (labelText,sumaryText='texto a leer') => ({
    type: 'object',
    class: 'input-default',
    label: sumaryText,
    check: {
        class: 'filled-in flex-reverse-column',
        label: 'activar',
        type: 'checkbox',
        returnType: 'boolean',
    },
    text: {
        class: 'input-default',
        label: labelText,
        type: 'text',
        returnType: 'string',
    },
});

const { ttsconfig, ttsdata } = keys.reduce((acc, { key, text, check }) => {
    acc.ttsconfig[key] = createTTSConfig('texto a leer',`config ${key}`);
    acc.ttsdata[key] = { text, check };
    return acc;
}, { ttsconfig: {}, ttsdata: {} });

console.log(ttsconfig);
console.log(ttsdata);

function getTTSdatastore() {
    return localStorage.getItem('ttsdatastore') ? JSON.parse(localStorage.getItem('ttsdatastore')) : ttsdata;
}
const callbackconfig = { callback: async (data,modifiedData) => {
    console.log("editcallback", data,modifiedData);
    localStorage.setItem('ttsdatastore', JSON.stringify(modifiedData));
  }
  , deletecallback:  undefined };
const configelement = new EditModal('#chatbotconfig',callbackconfig,ttsconfig);
configelement.render(getTTSdatastore());

const testdata = {
    uniqueId: 'testUser',
    comment: 'testComment',
    likeCount: 50,
    repeatCount: 123,
    giftName: 'testgiftName',
    diamondCount: 50,
    followRole: 0,
    userId: 1235646,
    teamMemberLevel: 0,
    subMonth: 0,
}
function Replacetextoread(eventType = 'chat',data) {
    const configtts = getTTSdatastore();
    console.log(configtts);
    if (!configtts[eventType] || !configtts[eventType].check) return;
    const textoread = replaceVariables(configtts[eventType].text, data);
    console.log(textoread,configtts[eventType].text);
    handleleermensaje(textoread);
}
export { Replacetextoread}
// asdasd como seria un metodo para hacer un string a json