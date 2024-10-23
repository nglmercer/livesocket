import DynamicTable, { EditModal } from '../components/renderfields.js';
import { databases, IndexedDBManager, DBObserver } from '../database/indexdb.js'
import { Counter, TypeofData,ComboTracker, replaceVariables, compareObjects } from '../utils/utils.js'
import showAlert from '../components/alerts.js';
const ObserverActions = new DBObserver();
const ActionsManager = new IndexedDBManager(databases.ActionsDB,ObserverActions);


const actionsconfig = {
  nombre: {
    class: 'input-default',
    type: 'textarea',
    returnType: 'string',
  }, 
  minecraft:{
    type: 'object',
    check: {
      class: 'filled-in',
      label: 'check',
      type: 'checkbox',
      returnType: 'boolean',
    },
    command: {
      class: 'input-default',
      label: '',
      type: 'textarea',
      returnType: 'string',
    },
  },
  tts: {
    label: 'TTS',
    type: 'object',
    check: {
      class: 'filled-in',
      label: 'check',
      type: 'checkbox',
      returnType: 'boolean',
    },
    text: {
      class: 'input-default',
      label: 'leer texto',
      type: 'text',
      returnType: 'string',
    },
  },
  id: {
    type: 'number',
    returnType: 'number',
    hidden: true,
  }
} 
const ActionModal = document.getElementById('ActionModal');
const Buttonform  = document.getElementById('ActionModalButton');
const testdata = {
  nombre: "coloca tu nombre",
  minecraft: {
    check: true,
    command: "/say coloca tu comando",
  },
  tts: {
    check: true,
    text: "texto a leer",
  },
  id: undefined,
}
const editcallback = async (data,modifiedData) => {
  const alldata = await ActionsManager.getAllData()
  const keysToCheck = [
    { key: 'nombre', compare: 'isEqual' },
  ];
  const callbackFunction = (matchingObject, index, results) => {
    console.log(`Objeto coincidente encontrado en el índice ${index}:`, matchingObject, results);
  };
  const primerValor = objeto => Object.values(objeto)[0];
  const primeraKey = objeto => Object.keys(objeto)[0];

  const results = compareObjects(modifiedData, alldata, keysToCheck, callbackFunction);
  console.log("results",results)
  if (results.validResults.length >= 1) {
    showAlert('error',`Objeto coincidente, cambie el ${primeraKey(results.coincidentobjects)}:`)
  } else {
    ActionModal.close();
    ActionsManager.saveData(modifiedData)
    showAlert('success','Se ha guardado el evento')
  }
}
const deletecallback =  async (data,modifiedData) => {
  ActionModal.close();
  console.log("deletecallback",data,modifiedData);
  updatedataformmodal(testdata)
} 
const callbackconfig = {
  callback: editcallback,
  deletecallback:  deletecallback,
  callbacktext: 'Guardar cambios',
  deletecallbacktext: 'cerrar',
};
const Aformelement = new EditModal('#ActionModalContainer',callbackconfig,actionsconfig);

Aformelement.render(testdata);
Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  updatedataformmodal(testdata)
  ActionModal.open();
};
function updatedataformmodal(data = testdata) {
  Aformelement.updateData(data)
  Aformelement.fillEmptyFields(data)
}
export { actionsconfig,ActionsManager }