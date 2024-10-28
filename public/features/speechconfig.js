import DynamicTable, { EditModal } from '../components/renderfields.js';
import { showAlert } from '../components/message.js';
import {replaceVariables, logger} from '../utils/utils.js';
import { leerMensajes, handleleermensaje } from '../audio/tts.js';
import { getTranslation, translations } from '../translations.js';
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
        label: getTranslation('activate'),
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
    acc.ttsconfig[key] = createTTSConfig(getTranslation('texttoread'),`${getTranslation('config')} ${getTranslation(key)}`);
    acc.ttsdata[key] = { text, check };
    return acc;
}, { ttsconfig: {}, ttsdata: {} });

console.log(ttsconfig);
console.log(ttsdata);

function getTTSdatastore() {
    const ttsdatastore = localStorage.getItem('ttsdatastore');
    if (!ttsdatastore) localStorage.setItem('ttsdatastore', JSON.stringify(ttsdata));
    return ttsdatastore ? JSON.parse(ttsdatastore) : ttsdata;
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
    if (!configtts[eventType] || !configtts[eventType].check) return;
    const textoread = replaceVariables(configtts[eventType].text, data);
    logger.log('speechchat',configtts,textoread,configtts[eventType].text)
    if (existwordinArray(textoread)) { showAlert('info',`${getTranslation('filterword')} ${textoread} `); return; }
    handleleermensaje(textoread);
}
class ArrayStorageManager {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.items = this.getAll();
    }
  
    getAll() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }
  
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }
  
    validateInput(item) {
        if (typeof item !== 'string') return false;
        if (item.length <= 1) return false;
        return true;
    }
  
    existInItems(text) {
        const normalizedText = text.toLowerCase();
        return this.items.some(item =>
            item.toLowerCase() === normalizedText
        );
    }
  
    add(item) {
        if (!this.validateInput(item)) return false;
        if (!this.existInItems(item)) {
            this.items.push(item);
            this.saveToStorage();
            return true;
        }
        return false;
    }
  
    remove(item) {
        const initialLength = this.items.length;
        this.items = this.items.filter(existingItem =>
            existingItem.toLowerCase() !== item.toLowerCase()
        );
        if (this.items.length !== initialLength) {
            this.saveToStorage();
            return true;
        }
        return false;
    }
  }
  
  // Clase para manejar la UI
  class ArrayManagerUI {
    constructor(storageManager, idelement) {
        this.manager = storageManager;
        this.setupModal();
        this.setupEventListeners(idelement);
    }
  
    setupModal() {
        const modal = document.createElement('div');
        modal.innerHTML = `
          <custom-modal modal-type="form" id="ArrayManagerUI">
                <h2 class="modal-title"><translate-text key="${this.manager.storageKey}"></translate-text>
                </h2>
                <div class="input-container">
                    <input type="text" id="itemInput" placeholder="${getTranslation('addelement')}">
                    <button id="addButton" class="open-modal-btn">${getTranslation('add')}</button>
                </div>
                <div id="errorMessage" class="error-message">
                    El texto debe tener al menos 2 caracteres
                </div>
                <div id="itemsContainer" class="items-container">
                </div>
            </custom-modal>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
    }
  
    setupEventListeners(idelement) {
      const buttonid = idelement ||'openModal';
        // Botón para abrir modal
        document.getElementById(buttonid).addEventListener('click', () => {
            this.openModal();
        });
  
        // Agregar item
        const input = this.modal.querySelector('#itemInput');
        const addButton = this.modal.querySelector('#addButton');
       
        const addItem = () => {
            const text = input.value.trim();
            const errorMessage = this.modal.querySelector('#errorMessage');
            errorMessage.style.display = 'none';
           
            if (this.manager.validateInput(text)) {
                if (this.manager.add(text)) {
                    this.createItemElement(text);
                    input.value = '';
                }
            } else {
                errorMessage.style.display = 'block';
            }
        };
  
        addButton.addEventListener('click', addItem);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItem();
        });
    }
  
    createItemElement(text) {
        const itemsContainer = this.modal.querySelector('#itemsContainer');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
       
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
       
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = '×';
        deleteButton.onclick = () => {
            this.manager.remove(text);
            itemDiv.remove();
        };
       
        itemDiv.appendChild(textSpan);
        itemDiv.appendChild(deleteButton);
        itemsContainer.appendChild(itemDiv);
    }
  
    loadItems() {
        const itemsContainer = this.modal.querySelector('#itemsContainer');
        itemsContainer.innerHTML = '';
        this.manager.getAll().forEach(item => {
            this.createItemElement(item);
        });
    }
  
    openModal() {
        this.loadItems();
        document.getElementById('ArrayManagerUI').open();
    }
  
    closeModal() {
        document.getElementById('ArrayManagerUI').close();
  }
  }
  
  // Inicialización
  const manager = new ArrayStorageManager('filterwords');
  const ui = new ArrayManagerUI(manager);
  function addfilterword(word) {
    manager.add(word);
    ui.loadItems();
  }
  function existwordinArray(word) {
    return manager.existInItems(word);
  }
export { Replacetextoread, addfilterword}
// asdasd como seria un metodo para hacer un string a json