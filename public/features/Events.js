import { Giftsparsed, mapselectgift } from '../assets/gifts.js';
import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from '../database/indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects } from '../utils/utils.js'
import showAlert from '../components/alerts.js';
import { ActionsManager } from './Actions.js'
const ObserverEvents = new DBObserver();
const EventsManager = new IndexedDBManager(databases.eventsDB,ObserverEvents);
async function EventsManagermap(data) {
  const alldata = await ActionsManager.getAllData()
/*   console.log("alldatainit",alldata)
  const mapedevents = alldata.map(data => ({
    value: data.id,
    label: data.nombre,
  }))
  console.log("alldata",mapedevents) */
  return  alldata.map(data => ({
    value: data.id,
    label: data.nombre,
  }))
}

// function async que se invoca a si mismo seria:
(async () => {
  const mapedevents = await EventsManagermap()
  console.log("mapedevents",mapedevents)
})()
const eventsconfig = {
  nombre: {
    class: 'input-default',
    type: 'textarea',
    returnType: 'string',
  },
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
  Actions: {
    class: 'input-default',
    type: 'multiSelect',
    returnType: 'array',
    options: await EventsManagermap(),
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
  if (results.validResults.length >= 1) {
    showAlert('error','ya existe un elemento en la base de datos igual')
  } else {
    EventsModal.close();
    EventsManager.saveData(modifiedData)
    showAlert('success','Se ha guardado el evento')
  }
}
const deletecallback = async (data,modifiedData) => {
  EventsModal.close();
  console.log("deletecallback", data,modifiedData);
}
const callbackconfig = { 
  callback: editcallback, deletecallback:  deletecallback,
  callbacktext: 'Guardar cambios',
  deletecallbacktext: 'cerrar',
};
const Formelement = new EditModal('#EventsModalContainer',callbackconfig,eventsconfig);
const testdata = {
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
  Formelement.updateData(testdata)
  setTimeout(() => {EventsModal.open()}, 100);
};
export { eventsconfig}