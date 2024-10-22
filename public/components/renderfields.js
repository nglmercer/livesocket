class DynamicTable {
  constructor(containerSelector, callback, config = {},deletecallback) {
    this.container = document.querySelector(containerSelector);
    this.config = config;
    this.columns = this.getOrderedColumns(config); // Establece las columnas en el orden deseado
    this.callback = callback;
    this.deletecallback = deletecallback;
    this.HtmlContainer = document.createElement('table');
    this.HtmlContainer.classList.add('dynamic-table');
    this.container.appendChild(this.HtmlContainer);
    this.canClear = true; // Bandera para controlar la limpieza

    this.createHeader();
  }


  getOrderedColumns(config) {
    return Object.keys(config);
  }

  getMaxColumns() {
    return this.columns.filter(key => !(this.config[key] && this.config[key].hidden)).length + 1;
  }

  createHeader() {
    const header = this.HtmlContainer.createTHead();
    const headerRow = header.insertRow();

    this.columns.forEach((key) => {
      if (this.config[key] && this.config[key].hidden) {
        return; // No añadimos encabezado para columnas ocultas
      }
      const th = document.createElement('th');
      th.textContent = key;
      th.dataset.key = key;
      headerRow.appendChild(th);
    });

    const th = document.createElement('th');
    th.textContent = 'Acciones';
    headerRow.appendChild(th);
  }

  addRow(data) {
    const row = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback,this.deletecallback);
    row.render();
    this.fillEmptyFields(data);
  }
  fillEmptyFields(data) {
    const filledData = { ...data }; // Copia los datos recibidos sin modificarlos

    this.columns.forEach((key) => {
      const columnConfig = this.config[key];

      if (columnConfig && columnConfig.type === 'object') {
        // Si el campo es un objeto, comprobamos cada subcampo
        filledData[key] = data[key] || {}; // Si no existe el objeto en los datos, lo inicializamos
        Object.keys(columnConfig).forEach(subKey => {
          if (subKey !== 'type' && !(subKey in filledData[key])) {
            filledData[key][subKey] = ''; // Añadimos solo los subcampos que faltan
          }
        });
      } else if (!(key in filledData)) {
        // Si el campo no es un objeto y no existe en los datos, lo añadimos vacío
        filledData[key] = '';
      }
    });

    return filledData;
  }

  hideColumn(columnKey) {
    const headerCells = this.HtmlContainer.tHead.rows[0].cells;
    for (let i = 0; i < headerCells.length; i++) {
      if (headerCells[i].dataset.key === columnKey) {
        headerCells[i].style.display = 'none';
      }
    }

    for (let row of this.HtmlContainer.rows) {
      const cells = row.cells;
      for (let i = 0; i < cells.length; i++) {
        if (this.columns[i] === columnKey) {
          cells[i].style.display = 'none';
        }
      }
    }
  }

  updateRows(data, clearInterval = 2000) {
    if (this.canClear) {
      this.clearRows(); // Limpiar antes de añadir nuevas filas
      this.canClear = false; // Desactivar la limpieza por 10 segundos
      setTimeout(() => {
        this.canClear = true; // Reactivar la limpieza después de 10 segundos
      }, clearInterval);
    }
      this.addRow(data); // Añadir las filas después de limpiar
  }

  clearRows() {
    while (this.HtmlContainer.rows.length > 1) {
      this.HtmlContainer.deleteRow(1);
    }
  }
}
class DynamicRow {
  constructor(table, data, columns, config, callback,deletecallback) {
    this.HtmlContainer = table;
    this.data = data;
    this.columns = columns;
    this.config = config;
    this.callback = callback;
    this.originalData = { ...data }; // Guardamos los datos originales
    this.modifiedData = JSON.parse(JSON.stringify(data)); // Inicializamos modifiedData con una copia profunda de originalData
    this.deletecallback = deletecallback;
  }

  render() {
    const row = this.HtmlContainer.insertRow();
    let cellIndex = 0;

    this.columns.forEach((key) => {
      const typeConfig = this.config[key];

      if (typeConfig && typeConfig.hidden) {
        return;
      }

      const cell = row.insertCell(cellIndex++);
      const value = this.data[key];

      if (typeConfig && typeConfig.type === 'object') {
        const objectContainer = document.createElement('details');
        if (typeConfig.open) {
          objectContainer.setAttribute('open', '');
        }
        const summary = document.createElement('summary');
        console.log("typeConfig summary", typeConfig, key);
        summary.textContent = typeConfig.label || 'Mostrar ' + key;

        objectContainer.appendChild(summary);

        Object.keys(typeConfig).forEach(subKey => {
          if (subKey === 'type') return;

          const subConfig = typeConfig[subKey];
          const subValue = value ? value[subKey] : undefined;
          const inputElement = this.createInputElement(key, subKey, subValue, subConfig, cell);

          if (inputElement) {
            const wrapper = document.createElement('div');
            if (subConfig.label) {
              const label = document.createElement('label');
              label.classList.add('grid-1fr-1fr-align-center');
              const span = document.createElement('span');
              span.textContent = subConfig.label;
              label.appendChild(inputElement);
              label.appendChild(span);
              wrapper.appendChild(label);
            } else {
              wrapper.appendChild(inputElement);
            }
            objectContainer.appendChild(wrapper);
          }
        });

        cell.appendChild(objectContainer);
      } else {
        const inputElement = this.createInputElement(key, null, value, typeConfig, cell);
        console.log("inputElement", inputElement);
        if (inputElement) {
          cell.appendChild(inputElement);
        } else {
          cell.textContent = value !== undefined ? value : '';
        }
      }
    });

    const actionCell = row.insertCell(cellIndex);
    const actionButton = document.createElement('button');
    actionButton.textContent = 'Guardar cambios';
    actionButton.className = 'savebutton custombutton';
    actionButton.addEventListener('click', () => {
      this.callback(row.rowIndex, this.originalData, this.modifiedData);
    });
    if (this.deletecallback) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';
      deleteButton.className = 'deletebutton custombutton';
      deleteButton.addEventListener('click', () => {
        this.deletecallback(row.rowIndex, this.originalData, this.modifiedData);
      });
      actionCell.appendChild(deleteButton);
    }
    actionCell.appendChild(actionButton);
  }
  renderDivs() {
    const container = document.createElement('div');
    container.classList.add('dynamic-row-container');

    this.columns.forEach((key) => {
      const typeConfig = this.config[key];

      if (typeConfig && typeConfig.hidden) {
        return;
      }

      const value = this.data[key];
      const itemContainer = document.createElement('div');
      itemContainer.classList.add('dynamic-row-item');

      if (typeConfig && typeConfig.type === 'object') {
        const objectContainer = document.createElement('details');
        if (typeConfig.open) {
          objectContainer.setAttribute('open', '');
        }
        const summary = document.createElement('summary');
        console.log("typeConfig summary", typeConfig, key);

        summary.textContent = typeConfig.label || 'Mostrar ' + key;

        objectContainer.appendChild(summary);

        Object.keys(typeConfig).forEach(subKey => {
          if (subKey === 'type' || subKey === 'open') return;

          const subConfig = typeConfig[subKey];
          const subValue = value ? value[subKey] : undefined;
          const inputElement = this.createInputElement(key, subKey, subValue, subConfig, itemContainer);

          if (inputElement) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('input-wrapper');

            if (subConfig.label && subConfig.label !== '' && subConfig.type !== 'checkbox') {
              const label = document.createElement('label');
              label.textContent = subConfig.label;
              wrapper.appendChild(label);
            }

            wrapper.appendChild(inputElement);
            objectContainer.appendChild(wrapper);
          }
        });

        itemContainer.appendChild(objectContainer);
      } else {
        const inputElement = this.createInputElement(key, null, value, typeConfig,container);
        if (inputElement) {
          itemContainer.appendChild(inputElement);
        } else {
          itemContainer.textContent = value !== undefined ? value : '';
        }
      }

      container.appendChild(itemContainer);
    });

    // Botones de acción
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action-container');

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar cambios';
    saveButton.className = 'savebutton custombutton';
    saveButton.addEventListener('click', () => {
      this.callback(this.originalData, this.modifiedData);
    });
    if (this.deletecallback) {

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.className = 'deletebutton custombutton';
    deleteButton.addEventListener('click', () => {
      this.deletecallback(this.originalData, this.modifiedData);
    });

    actionContainer.appendChild(deleteButton);
  }
    actionContainer.appendChild(saveButton);
    container.appendChild(actionContainer);

    return container;
  }
  
  createInputElement(key, subKey, value, typeConfig, HtmlContainer) {
    if (value === undefined && subKey === 'class' || subKey === 'label') {
      // console.log("createInputElement return", key, subKey, value, typeConfig);
      return null;
    }
    // if (value === undefined) return;
    let inputElement;

    // Manejar el tipo de elemento según el typeConfig.type
    switch (typeConfig?.type) {
      case 'slider':
        inputElement = this.createSliderElement(key, subKey, value, typeConfig);
        break;
      case 'checkbox':
        inputElement = this.createCheckboxElement(key, subKey, value, typeConfig);
        break;
      case 'number':
        inputElement = this.createNumberElement(key, subKey, value);
        break;
      case 'text':
      case 'string':
        inputElement = this.createTextElement(key, subKey, value);
        break;
      case 'textarea':
        inputElement = this.createtexareaElement(key, subKey, value);
        break;
      case 'select':
        inputElement = this.createSelectElement(key, subKey, value, typeConfig, HtmlContainer);
        break;
      case 'select2':
        inputElement = this.createSelect2Element(key, subKey, value, typeConfig, HtmlContainer);
        break;
      case 'multiSelect':
        inputElement = this.createMultiSelectElement(key, subKey, value, typeConfig);
        break;
      case 'radio':
        inputElement = this.createRadioElement(key, subKey, value, typeConfig, HtmlContainer);
        break;
      default:
        // Por defecto, crear un input type="text"
        inputElement = this.createTextElement(key, subKey, value);
    }

    // Agregar clase si existe
    if (typeConfig?.class) {
      inputElement.className = typeConfig.class;
    }
    if (typeConfig.dataAssociated) {
          inputElement.setAttribute('data-associated', typeConfig.dataAssociated);
    }
    return inputElement || document.createTextNode('');
  }
  createSelectElement(key, subKey, value, typeConfig, HtmlContainer) {
    const divElement = document.createElement('div');
    divElement.classList.add('div-select');
    const selectElement = document.createElement('select');
    selectElement.id = key;
    selectElement.classList.add('select');
    // console.log("select",typeConfig);
    if (typeConfig.options) {
      typeConfig.options.forEach(option => {
        const optionElement = document.createElement('option');
        if (typeof option.value === 'object') {
          optionElement.value = option.value.index;
          optionElement.textContent = option.label;
          optionElement.selected = option.value.index === value; // Marca como seleccionado si coincide con el valor actual
          selectElement.appendChild(optionElement);
        } else {

          optionElement.value = option.value;
          optionElement.textContent = option.label;
          optionElement.selected = option.value === value; // Marca como seleccionado si coincide con el valor actual
          selectElement.appendChild(optionElement);
        }
      });
    }

    selectElement.value = value;
    if (typeConfig.toggleoptions) setTimeout(this.handletoggleoptions(subKey, value, HtmlContainer), 500);
    
    selectElement.addEventListener('change', () => {
      this.updateModifiedData(key, subKey, selectElement.value);
      if (typeConfig.toggleoptions) this.handletoggleoptions(subKey, selectElement.value, HtmlContainer);

    });
    const labelElement = document.createElement('label');
    divElement.appendChild(selectElement);
    if (typeConfig.label) {
      labelElement.textContent = typeConfig.label;
      labelElement.classList.add('label');
      labelElement.setAttribute('for', key);
      divElement.appendChild(labelElement);
    }
    return divElement;
  }
  createSelect2Element(key, subKey, value, typeConfig, HtmlContainer) { 
    const divElement = document.createElement('div');
    const selectComponent = document.createElement('custom-select');
    selectComponent.setOptions(typeConfig.options);
    selectComponent.setValue(value);  // Establecer valor predeterminado
    if (typeConfig.toggleoptions) setTimeout(this.handletoggleoptions(subKey, value, HtmlContainer), 500);
    // Añadir el evento change
    selectComponent.addEventListener('change', (e) => {
        console.log('Seleccionado:', e.detail);
        console.log('Valor:', selectComponent.getValue());
        console.log('mySelect:', selectComponent.value);
        this.updateModifiedData(key, subKey, selectComponent.value);
        if (typeConfig.toggleoptions) handletoggleoptions(subKey, selectComponent.value, HtmlContainer);
        
      });

    const labelElement = document.createElement('label');
    divElement.appendChild(selectComponent);
    if (typeConfig.label) {
      labelElement.textContent = typeConfig.label;
      labelElement.classList.add('label');
      labelElement.setAttribute('for', key);
      divElement.appendChild(labelElement);
    }
    return divElement
  }
  createRadioElement(key, subKey, value, typeConfig, HtmlContainer) {
    const divElement = document.createElement('div');
    divElement.classList.add('div-radio-group');

    if (typeConfig.options) {
        typeConfig.options.forEach(option => {
            const radioWrapper = document.createElement('div');
            radioWrapper.classList.add('radio-wrapper');
            
            const radioElement = document.createElement('input');
            radioElement.type = 'radio';
            radioElement.name = key;
            radioElement.id = `${key}_${option.value}`; // Unique ID for each radio
            radioElement.value = typeof option.value === 'object' ? option.value.index : option.value;
            radioElement.checked = radioElement.value == value; // Marca como seleccionado si coincide con el valor actual
            
            const labelElement = document.createElement('label');
            labelElement.textContent = option.label;
            labelElement.classList.add('label');
            labelElement.setAttribute('for', radioElement.id);

            radioWrapper.appendChild(radioElement);
            radioWrapper.appendChild(labelElement);
            divElement.appendChild(radioWrapper);

            // Listener para actualizar el valor seleccionado
            radioElement.addEventListener('change', () => {
                if (radioElement.checked) {
                    this.updateModifiedData(key, subKey, radioElement.value);
                    if (typeConfig.toggleoptions) {
                        this.handletoggleoptions(subKey, radioElement.value, HtmlContainer);
                    }
                }
            });
        });
    }

    if (typeConfig.toggleoptions) {
        setTimeout(() => {
            this.handletoggleoptions(subKey, value, HtmlContainer);
        }, 500);
    }

    return divElement;
  }

  createSliderElement(key, subKey, value, typeConfig) {
    const inputElement = document.createElement('input');
    inputElement.type = 'range';
    inputElement.min = typeConfig.min || 0;
    inputElement.max = typeConfig.max || 100;
    inputElement.value = value;

    inputElement.addEventListener('input', () => {
      const returnValue = typeConfig.returnType === 'number' ? Number(inputElement.value) : inputElement.value;
      this.updateModifiedData(key, subKey, returnValue);
    });

    return inputElement;
  }

  createCheckboxElement(key, subKey, value, typeConfig) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('checkbox-wrapper'); // Clase para ajustar el tamaño

    const inputElement = document.createElement('input');
    inputElement.type = 'checkbox';
    inputElement.checked = value;
    inputElement.id = `${key}_${subKey}`; // Generar un id único
    inputElement.className = 'checkbox-4';
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', inputElement.id); // Relacionar el label con el checkbox
    labelElement.textContent = typeConfig.label || subKey; // Texto del label o ajusta según tus necesidades

    inputElement.addEventListener('change', () => {
      const returnValue = inputElement.checked;
      this.updateModifiedData(key, subKey, returnValue);
    });

    wrapper.appendChild(inputElement);
    wrapper.appendChild(labelElement);

    return wrapper;
  }

  createNumberElement(key, subKey, value) {
    const inputElement = document.createElement('input');
    inputElement.type = 'number';
    inputElement.value = value;
    inputElement.placeholder = key + ' ' + subKey;

    inputElement.addEventListener('input', () => {
      const returnValue = Number(inputElement.value);
      this.updateModifiedData(key, subKey, returnValue);
    });

    return inputElement;
  }

  createTextElement(key, subKey, value) {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = value || '';
    inputElement.placeholder = key + ' ' + subKey;

    inputElement.addEventListener('input', () => {
      const returnValue = inputElement.value;
      this.updateModifiedData(key, subKey, returnValue);
    });

    return inputElement;
  }
  createtexareaElement(key, subKey, value) {
    const inputElement = document.createElement('textarea');
    inputElement.value = value || '';
    inputElement.autocomplete = 'on';
    inputElement.placeholder = key + ' ' + subKey;
    // console.log("createtexareaElement", key, subKey, value);
    inputElement.cols = 50;
    inputElement.addEventListener('input', () => {
      const returnValue = inputElement.value;
      this.updateModifiedData(key, subKey, returnValue);
    });
    return inputElement;
  }
  createMultiSelectElement(key, subKey, value, typeConfig) {
    const fieldConfig = {
      label: typeConfig.label,
      options: typeConfig.options,
      name: key,
    };
    // console.log("createMultiSelectElement", fieldConfig,value);
    const multiSelectField = createMultiSelectField1(fieldConfig, (selectedValues) => {
      this.updateModifiedData(key, subKey, selectedValues);
    }, value);

    return multiSelectField;
  }


  updateModifiedData(key, subKey, value) {
    if (subKey) {
      if (!this.modifiedData[key]) {
        this.modifiedData[key] = {};
      }
      this.modifiedData[key][subKey] = value;
    } else {
      this.modifiedData[key] = value;
    }
  }
  handletoggleoptions(key, subKey, HtmlContainer) {
        const fields = HtmlContainer.querySelectorAll('[data-associated]');
        if (!fields) return; 
        fields.forEach(field => {
          if (field.getAttribute('data-associated') === subKey) {
            field.style.display = 'block';
          } else {
            field.style.display = 'none';
          }
    });
    console.log("handletoggleoptions", key, subKey, HtmlContainer);
  }
  updateData(newData) {
    this.data = { ...newData };
    this.originalData = { ...newData };
    this.modifiedData = JSON.parse(JSON.stringify(newData));
  }
}
function createMultiSelectField1(field, onChangeCallback, value) {
  const container = document.createElement('div');
  container.classList.add('input-field', 'col', 's12', 'gap-padding-margin-10');

  const label = document.createElement('label');
  label.textContent = field.label;

  // Campo de búsqueda
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Buscar...';
  searchInput.classList.add('search-input', 'center-text');

  // Contenedor de las opciones
  const gridSelect = document.createElement('div');
  gridSelect.classList.add('grid-select');

  // Función para renderizar las opciones
  function renderOptions(options) {
    gridSelect.innerHTML = '';  // Limpiar las opciones actuales
    options.forEach(option => {
      const checkbox = document.createElement('label');
      checkbox.classList.add('grid-select__option');

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = field.name;
      // Guardamos directamente el valor del objeto, no su versión string
      input.value = typeof option.value === 'object' ? option.value.index : option.value;
      input.dataset.id = option.id;
      input.classList.add('filled-in');

      // Comprobar si esta opción está seleccionada y marcarla
      if (Array.isArray(value) && value.includes(String(input.value))) {
        input.checked = true; // Marcar como seleccionado
      }

      const labelText = document.createElement('span');
      labelText.textContent = option.label;

      // Escuchar cambios en los checkboxes y pasar el valor actualizado al callback
      input.addEventListener('change', () => {
        const selectedValues = Array.from(gridSelect.querySelectorAll('input[type="checkbox"]:checked'))
          .map(checkbox => checkbox.value); // Ahora estamos pasando los valores correctos
        onChangeCallback(selectedValues);
      });

      checkbox.appendChild(input);
      checkbox.appendChild(labelText);
      gridSelect.appendChild(checkbox);
    });
  }

  // Inicializar las opciones
  renderOptions(field.options);

  // Filtrar opciones en base al texto ingresado en el buscador
  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const options = gridSelect.querySelectorAll('.grid-select__option');

    options.forEach(option => {
      const labelText = option.querySelector('span').textContent.toLowerCase();
      // Añadir o quitar la clase 'hidden' según el término de búsqueda
      if (labelText.includes(searchTerm)) {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }
    });
  });

  container.appendChild(label);
  container.appendChild(searchInput);  // Agregar el campo de búsqueda
  container.appendChild(gridSelect);

  return container;
}
export class EditModal {
  constructor(containerSelector, callback, config = {}) {
    this.HtmlContainer = document.querySelector(containerSelector);
    this.config = config;
    this.callback = callback.callback;
    this.deletecallback = callback.deletecallback;
    // this.HtmlContainer = document.createElement('div');
    this.columns = this.getOrderedElements(config); // Establece las columnas en el orden deseado
    this.renderelement = new DynamicRow(this.HtmlContainer, {}, this.columns, this.config, this.callback,this.deletecallback);
  }
  render(data) {
    this.renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback,this.deletecallback);
    const renderhtml = this.renderelement.renderDivs();
    this.HtmlContainer.appendChild(renderhtml);
    console.log("renderhtml", renderhtml);
  }
  ReturnHtml(data){
    const renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback,this.deletecallback);
    const renderhtml = renderelement.renderDivs();
    return renderhtml;
  }
  addRow(data) {
    const renderelement = new DynamicRow(this.HtmlContainer, data, this.columns, this.config, this.callback,this.deletecallback);
    const renderhtml = renderelement.renderDivs();
    return renderhtml
  }
  getOrderedElements(config) {
    return Object.keys(config);
  }
  fillEmptyFields(data) {
    const filledData = { ...data }; // Copia los datos recibidos sin modificarlos

    this.columns.forEach((key) => {
      const columnConfig = this.config[key];

      if (columnConfig && columnConfig.type === 'object') {
        // Si el campo es un objeto, comprobamos cada subcampo
        filledData[key] = data[key] || {}; // Si no existe el objeto en los datos, lo inicializamos
        Object.keys(columnConfig).forEach(subKey => {
          if (subKey !== 'type' && !(subKey in filledData[key])) {
            filledData[key][subKey] = ''; // Añadimos solo los subcampos que faltan
          }
        });
      } else if (!(key in filledData)) {
        // Si el campo no es un objeto y no existe en los datos, lo añadimos vacío
        filledData[key] = '';
      }
    });

    return filledData;
  }
  updateData(newData) {
    this.renderelement.updateData(newData)
  }
}

export default DynamicTable;
