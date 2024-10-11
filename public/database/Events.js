import { Giftsparsed, mapselectgift } from '../assets/gifts.js';
import DynamicTable, { EditModal } from '../components/renderfields.js';
const config = {
    nombre: {
      class: 'input-default',
      type: 'textarea',
      returnType: 'string',
    }, // Especifica el orden de las columnas
    Evento: {
      class: 'input-default',
      // label: 'Evento',
      type: 'object',
      open: true,
      eventType: {
        class: 'select-default',
        type: 'select',
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
        hidden: true,
        dataAssociated: 'chat',
      },
      like: {
        label: '',
        class: 'input-default',
        type: 'number',
        returnType: 'number',
        hidden: true,
        dataAssociated: 'like',
      },
      gift: {
        class: 'input-default',
        label: '',
        type: 'select',
        returnType: 'number',
        options: mapselectgift,
        dataAssociated: 'gift',
      },
    },
    id: {
      type: 'number',
      returnType: 'number',
      hidden: true,
    }
  };
  const EventsModal = document.getElementById('EventsModal');
  const Buttonform  = document.getElementById('EventsModalButton');
  const editcallback = async (index, data,modifiedData) => {
    console.log("editcallback", index, data,modifiedData);
    EventsModal.close();
  }
  const deletecallback = async (index, data,modifiedData) => {
    EventsModal.close();
    console.log("deletecallback", index, data,modifiedData);
  }
const Formelement = new EditModal('#EventsModalContainer',editcallback,config,deletecallback);
const testdata = 
  {
    nombre: "coloca tu nombre",
    Evento: {
      eventType: "chat",
      chat: "default text",
      like: 10,
      gift: 10,
    },
    id: null,
  }
Formelement.render(testdata);

Buttonform.className = 'open-modal-btn';
Buttonform.onclick = () => {
  EventsModal.open();
};
