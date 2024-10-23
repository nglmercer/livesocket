import DynamicTable, { EditModal } from '../components/renderfields.js';
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

const callbackconfig = { callback: async (index, data,modifiedData) => {
  console.log("editcallback", index, data,modifiedData);
  ActionModal.close();
}
, deletecallback:  async (index, data,modifiedData) => {
  ActionModal.close();
  console.log("deletecallback", index, data,modifiedData);
} };
const Aformelement = new EditModal('#ActionModalContainer',callbackconfig,actionsconfig);
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
Aformelement.render(testdata);
Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  ActionModal.open();
  Aformelement.updateData(testdata)
};
export { actionsconfig }