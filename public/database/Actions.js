import { Giftsparsed, mapselectgift } from '../assets/gifts.js';
import DynamicTable from '../components/renderfields.js';
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
      eventType: {
        class: 'select-default',
        type: 'select',
        returnType: 'string',
        options: [{ value: 'chat', label: 'Chat' }, { value: 'follow', label: 'Seguimiento' },{ value: 'like', label: 'like'},
       {value: 'share', label: 'compartir'}, { value: 'subscribe', label: 'suscripcion' }, { value: 'gift', label: 'Gift' }],
      },
      chat: {
        label: 'chat',
        class: 'input-default',
        type: 'textarea',
        returnType: 'string',
        hidden: true,
      },
      like: {
        label: 'like',
        class: 'input-default',
        type: 'number',
        returnType: 'number',
        hidden: true,
      },
      gift: {
        class: 'input-default',
        label: '',
        type: 'select',
        returnType: 'number',
        options: mapselectgift
      },
    },
    id: {
      type: 'number',
      returnType: 'number',
      hidden: true,
    }
  };
  const editcallback = async (index, data,modifiedData) => {
    console.log("editcallback", index, data,modifiedData);
  }
  const deletecallback = async (index, data,modifiedData) => {
    console.log("deletecallback", index, data,modifiedData);
  }
const Formelement = new DynamicTable('#table-container',editcallback,config,deletecallback);
const testdata = 
  {
    nombre: "test",
    Evento: {
      eventType: "chat",
      chat: "test",
      like: 10,
      gift: 10,
    },
    id: 10,
  }
Formelement.addRow(testdata);