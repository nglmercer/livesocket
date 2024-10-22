import DynamicTable, { EditModal } from '../components/renderfields.js';
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

const ttsdatastore = localStorage.getItem('ttsdatastore') ? JSON.parse(localStorage.getItem('ttsdatastore')) : ttsdata;

const callbackconfig = { callback: async (data,modifiedData) => {
    console.log("editcallback", data,modifiedData);
    localStorage.setItem('ttsdatastore', JSON.stringify(modifiedData));
  }
  , deletecallback:  undefined };
const configelement = new EditModal('#chatbotconfig',callbackconfig,ttsconfig);
configelement.render(ttsdatastore);
// asdasd como seria un metodo para hacer un string a json