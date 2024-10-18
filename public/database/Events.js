import { Giftsparsed, mapselectgift } from '../assets/gifts.js';
import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from './indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects } from '../utils/utils.js'

const ObserverEvents = new DBObserver();
const EventsManager = new IndexedDBManager(databases.eventsDB,ObserverEvents);

const config = {
    nombre: {
      class: 'input-default',
      type: 'textarea',
      returnType: 'string',
    }, // Especifica el orden de las columnas
      eventType: {
        class: 'radio-default',
        type: 'radio',
        toggleoptions: true,
        returnType: 'string',
        options: [{ value: 'chat', label: 'Chat' }, { value: 'follow', label: 'Seguimiento' },{ value: 'like', label: 'like'},
       {value: 'share', label: 'compartir'}, { value: 'subscribe', label: 'suscripcion' }, { value: 'gift', label: 'Gift' }],
      },
      chat: {
        label: '',
        class: 'input-default',
        type: 'textarea',
        returnType: 'string',
        dataAssociated: 'chat',
      },
      like: {
        label: '',
        class: 'input-default',
        type: 'number',
        returnType: 'number',
        dataAssociated: 'like',
      },
      gift: {
        class: 'input-default',
        label: '',
        type: 'select2',
        returnType: 'number',
        options: mapselectgift,
        dataAssociated: 'gift',
      },
    id: {
      type: 'number',
      returnType: 'number',
      hidden: true,
    }
  };
  const EventsModal = document.getElementById('EventsModal');
  const Buttonform  = document.getElementById('EventsModalButton');
  const editcallback = async (data,modifiedData) => {
    console.log("editcallback", data,modifiedData);
    const alldata = await EventsManager.getAllData()
    console.log("alldata",alldata)
    
    const keysToCheck = [
      { key: 'eventType', compare: 'isEqual' },
/*       { key: 'gift', compare: 'isEqual' },
 */      { key: modifiedData.eventType, compare: 'isEqual' }
    ];    
    const callbackFunction = (matchingObject, index, results) => {
      console.log(`Objeto coincidente encontrado en el índice ${index}:`, matchingObject, results);
    };
    
    const results = compareObjects(modifiedData, alldata, keysToCheck, callbackFunction);
    console.log("results",results)

    //const existdata = 
    //EventsModal.close();
    //EventsManager.saveData(modifiedData)
  }
  const deletecallback = async (index, data,modifiedData) => {
    EventsModal.close();
    console.log("deletecallback", index, data,modifiedData);
  }
const Formelement = new EditModal('#EventsModalContainer',editcallback,config,deletecallback);
const testdata = 
  {
    nombre: "coloca tu nombre",
      eventType: "chat",
      chat: "default text",
      like: 10,
      gift: 5655,
      id: undefined,
  }
Formelement.render(testdata);

Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  EventsModal.open();
};
