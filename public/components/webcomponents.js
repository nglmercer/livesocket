// import en el lado del cliente... html

class CustomSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.options = [];
        this.selectedOption = null;
        this.searchTerm = '';
        this.render();
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    // Getter para la propiedad 'value'
    get value() {
        return this.selectedOption ? this.selectedOption.value : null;
    }

    // Setter para la propiedad 'value'
    set value(newValue) {
        this.setValue(newValue);
    }

    setOptions(options) {
        this.options = options;
        this.renderOptions();
    }

    setValue(value) {
        const option = this.options.find(opt => opt.value === value);
        if (option) {
            this.selectedOption = option;
            this.renderSelectedOption();
        }
    }

    getValue() {
        return this.selectedOption ? this.selectedOption.value : null;
    }

    render() {
        this.shadowRoot.innerHTML = `
<style>
    :host {
        --background-color: #333;
        --text-color: #fff;
        --border-color: #555;
        --option-hover-bg: #444;
        --input-bg: #444;
        --input-text-color: #fff;
    }

    .select-wrapper {
        position: relative;
        width: 200px;
    }

    .selected {
        display: flex;
        align-items: center;
        padding: 8px;
        border: 1px solid var(--border-color);
        cursor: pointer;
        background-color: var(--background-color);
        color: var(--text-color);
    }

    .selected img {
        margin-right: 8px;
        width: 24px;
        height: 24px;
    }

    .dropdown {
        display: none;
        position: absolute;
        top: 100%;
        width: 100%;
        border: 1px solid var(--border-color);
        max-height: 200px;
        overflow-y: auto;
        background: var(--background-color);
        z-index: 10;
    }

    .dropdown.open {
        display: block;
    }

    .option {
        display: flex;
        align-items: center;
        padding: 8px;
        cursor: pointer;
        color: var(--text-color);
    }

    .option img {
        margin-right: 8px;
        width: 24px;
        height: 24px;
    }

    .option:hover {
        background-color: var(--option-hover-bg);
    }

    .search {
        padding: 8px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--input-bg);
    }

    .search input {
        width: 100%;
        padding: 4px;
        background-color: var(--input-bg);
        color: var(--input-text-color);
        border: none;
    }

    .search input::placeholder {
        color: #bbb;
    }
</style>

            <div class="select-wrapper">
                <div class="selected">
                    <img src="" alt="" style="display: none;">
                    <span>Seleccione una opción</span>
                </div>
                <div class="dropdown">
                    <div class="search">
                        <input type="text" placeholder="Buscar...">
                    </div>
                    <div class="options"></div>
                </div>
            </div>
        `;
    }

    renderOptions() {
        const optionsContainer = this.shadowRoot.querySelector('.options');
        optionsContainer.innerHTML = '';
        this.options
            .filter(option => option.label.toLowerCase().includes(this.searchTerm.toLowerCase()))
            .forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option');
                optionElement.innerHTML = `
                    ${option.image ? `<img src="${option.image}" alt="${option.value}">` : ''}
                    <span>${option.label}</span>
                `;
                optionElement.addEventListener('click', () => this.selectOption(option));
                optionsContainer.appendChild(optionElement);
            });
    }

    renderSelectedOption() {
        const selectedElement = this.shadowRoot.querySelector('.selected span');
        const selectedImage = this.shadowRoot.querySelector('.selected img');
        
        if (this.selectedOption) {
            selectedElement.textContent = this.selectedOption.label;
            if (this.selectedOption.image) {
                selectedImage.src = this.selectedOption.image;
                selectedImage.style.display = 'block';
            } else {
                selectedImage.style.display = 'none';
            }
        } else {
            selectedElement.textContent = 'Seleccione una opción';
            selectedImage.style.display = 'none';
        }
    }

    setupEventListeners() {
        const selected = this.shadowRoot.querySelector('.selected');
        const dropdown = this.shadowRoot.querySelector('.dropdown');
        const searchInput = this.shadowRoot.querySelector('.search input');

        selected.addEventListener('click', () => {
            console.log("opendqwdas",dropdown)
            dropdown.classList.toggle('open');
        });

        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderOptions();
        });

/*         document.addEventListener('click', (e) => {
            console.log("click123123",e)
            if (!this.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        }); */
    }

    selectOption(option) {
        this.selectedOption = option;
        this.renderSelectedOption();
        this.shadowRoot.querySelector('.dropdown').classList.remove('open');
        this.dispatchEvent(new CustomEvent('change', { detail: option }));
    }
}

customElements.define('custom-select', CustomSelect);
class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Singleton instance
        if (!UserProfile.instance) {
            UserProfile.instance = this;
            
            this.state = {
                connected: false,
                username: '',
                imageUrl: 'https://via.placeholder.com/100/1a1a2e',
                language: 'es'
            };

            this.translations = {
                es: {
                    connect: 'Conectar',
                    disconnect: 'Desconectar',
                    placeholder: 'Ingresa tu nombre'
                },
                en: {
                    connect: 'Connect',
                    disconnect: 'Disconnect',
                    placeholder: 'Enter your name'
                }
            };
            
            this.loadFromLocalStorage();
        }

        // Registro de instancias
        if (!UserProfile.instances) {
            UserProfile.instances = new Set();
        }
        UserProfile.instances.add(this);

        // Cada instancia mantiene sus propios listeners
        this.activeListeners = new Set();

        this.render();
        return this;
    }

    static get observedAttributes() {
        return ['minimal'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'minimal') {
            this.render();
        }
    }

    get isMinimal() {
        return this.hasAttribute('minimal');
    }

    static updateAllInstances() {
        UserProfile.instances.forEach(instance => {
            instance.render();
        });
    }

    getStyles() {
        // ... (mismos estilos que antes) ...
        return `
            <style>
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background-color: #1a1a2e;
                    border-radius: 8px;
                    color: #fff;
                }

                /* Estilos para modo minimal */
                :host([minimal]) .container {
                    flex-direction: row;
                    padding: 8px;
                    gap: 10px;
                    background-color: transparent;
                }

                .profile-image {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #4d7cff;
                    box-shadow: 0 0 15px rgba(77, 124, 255, 0.3);
                    transition: all 0.3s ease;
                }

                :host([minimal]) .profile-image {
                    width: 36px;
                    height: 36px;
                    border-width: 2px;
                }

                .profile-image:hover {
                    transform: scale(1.05);
                    border-color: #4d9cff;
                }

                input {
                    width: 100%;
                    padding: 12px;
                    background-color: #162447;
                    border: 2px solid #4d9cff;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                :host([minimal]) input {
                    padding: 6px;
                }

                input:focus {
                    outline: none;
                    border-color: #e94560;
                    box-shadow: 0 0 10px rgba(233, 69, 96, 0.2);
                }

                input::placeholder {
                    color: #8a8a9e;
                }

                input:disabled {
                    background-color: #1f1f3d;
                    border-color: #404060;
                    cursor: not-allowed;
                }

                button {
                    width: 100%;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #4d7cff 0%, #3b5998 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                :host([minimal]) button {
                    width: auto;
                    padding: 6px 12px;
                    font-size: 12px;
                }

                button:hover {
                    background: linear-gradient(135deg, #5a88ff 0%, #4866ab 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(77, 124, 255, 0.3);
                }

                button:active {
                    transform: translateY(0);
                }

                button.connected {
                    background: linear-gradient(135deg, #e94560 0%, #c23152 100%);
                }

                button.connected:hover {
                    background: linear-gradient(135deg, #f25672 0%, #d4405f 100%);
                }
            </style>
        `;
    }

    render() {
        const state = UserProfile.instance.state;
        const currentTranslations = UserProfile.instance.translations[state.language];
        
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="container ${state.connected ? 'connected' : ''}">
                <img 
                    class="profile-image" 
                    src="${state.imageUrl}"
                    alt="Profile"
                />
                <input 
                    type="text"
                    placeholder="${currentTranslations.placeholder}"
                    value="${state.username}"
                    ${state.connected ? 'disabled' : ''}
                />
                <button class="${state.connected ? 'connected' : ''}">
                    ${state.connected ? currentTranslations.disconnect : currentTranslations.connect}
                </button>
            </div>
        `;

        // Configurar listeners para cada instancia después de renderizar
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Limpia los listeners anteriores de esta instancia
        this.activeListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.activeListeners.clear();

        const button = this.shadowRoot.querySelector('button');
        const input = this.shadowRoot.querySelector('input');

        // Los handlers usan la instancia singleton para la lógica
        const buttonHandler = () => {
            if (UserProfile.instance.state.connected) {
                UserProfile.instance.disconnect();
            } else if (input.value.trim()) {
                UserProfile.instance.connect(input.value);
            }
        };

        const inputHandler = (e) => {
            UserProfile.instance.state.username = e.target.value;
        };

        button.addEventListener('click', buttonHandler);
        input.addEventListener('input', inputHandler);

        // Guarda las referencias para limpieza
        this.activeListeners.add({ element: button, type: 'click', handler: buttonHandler });
        this.activeListeners.add({ element: input, type: 'input', handler: inputHandler });
    }

    loadFromLocalStorage() {
        const savedState = localStorage.getItem('userProfileState');
        if (savedState) {
            this.state = { ...this.state, ...JSON.parse(savedState) };
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('userProfileState', JSON.stringify(this.state));
    }

    connect(username) {
        if (this !== UserProfile.instance) return;
        
        this.state.connected = true;
        this.state.username = username;
        this.state.imageUrl = 'https://via.placeholder.com/100/4d7cff';
        this.saveToLocalStorage();
        UserProfile.updateAllInstances();
        this.dispatchEvent(new CustomEvent('userConnected', { 
            detail: { username: this.state.username }
        }));
    }

    disconnect() {
        if (this !== UserProfile.instance) return;
        
        this.state.connected = false;
        this.state.imageUrl = 'https://via.placeholder.com/100/1a1a2e';
        this.state.username = '';
        this.saveToLocalStorage();
        UserProfile.updateAllInstances();
        this.dispatchEvent(new CustomEvent('userDisconnected'));
    }

    setLanguage(lang) {
        if (this !== UserProfile.instance) return;
        
        if (this.translations[lang]) {
            this.state.language = lang;
            this.saveToLocalStorage();
            UserProfile.updateAllInstances();
        }
    }

    setProfileImage(url) {
        if (this !== UserProfile.instance) return;
        
        this.state.imageUrl = url;
        this.saveToLocalStorage();
        UserProfile.updateAllInstances();
    }

    disconnectedCallback() {
        UserProfile.instances.delete(this);
        
        // Limpia los listeners cuando se remueve el elemento
        this.activeListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        
        if (this === UserProfile.instance) {
            UserProfile.instance = null;
        }
    }
}

customElements.define('user-profile', UserProfile);
class ResponsiveNavSidebar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
  
      this.shadowRoot.innerHTML = `
          <style>
          :host {
            --sidebar-width: 250px;
            --sidebar-bg: #333;
            --nav-bg: #333;
            --text-color: #fff;
            --nav-height: 60px;
            --hover-bg: rgba(255, 255, 255, 0.1);
            --active-bg: #555;
          }
            .container {
              height: 100%;
            }
              .menu-item {
                .active {
                background-color: var(--active-bg);
                color: var(--active-color);
              }
              }
            /* Estilos para navegación superior fija */
            .top-nav {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: var(--nav-height);
              background: var(--nav-bg);
              color: var(--text-color);
              z-index: 888;
              padding: auto;
            }
    
            .top-nav-content {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
    
            /* Contenedor de items base en el navbar */
            .nav-base-items {
              display: flex;
              align-items: center;
              gap: 20px;
            }
    
            /* Contenedor de items base en el sidebar */
            .sidebar-base-items {
              margin-bottom: 15px;
            }
    
            /* Estilos para el sidebar */
            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              width: var(--sidebar-width);
              height: 100vh;
              background: var(--sidebar-bg);
              color: var(--text-color);
              overflow-y: auto;
              z-index: 999;
            }
    
            .sidebar-content {
              padding: 20px;
            }
    
            .menu-btn {
              display: none;
              background: none;
              border: none;
              color: var(--text-color);
              font-size: 24px;
              cursor: pointer;
              padding: 10px;
            }
    
            .content {
              margin-left: var(--sidebar-width);
              padding: 20px;
            }
    
            /* Overlay para cerrar el menú en móvil */
            .overlay {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              z-index: 800;
            }
    
            /* Estilos para elementos del menú */
            ::slotted(.menu-item) {
              padding: 12px 15px;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: background-color 0.2s;
              border-radius: 4px;
              margin: 5px 0;
            }
    
            ::slotted(.menu-item:hover) {
              background: var(--hover-bg);
            }
    
            ::slotted(.base-item) {
              padding: 12px 15px;
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: background-color 0.2s;
              border-radius: 4px;
              margin: 5px 0;
            }
    
            ::slotted(.base-item:hover) {
              background: var(--hover-bg);
            }
    
            /* Media query para modo responsive */
            @media (max-width: 768px) {
              .top-nav {
                display: flex;
              }
    
              .content {
                margin-left: 0;
                padding-top: calc(var(--nav-height) + 20px);
              }
    
              .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
              }
    
              .sidebar.active {
                transform: translateX(0);
              }
    
              .menu-btn {
                display: block;
              }
    
              .overlay.active {
                display: block;
              }
    
              /* En móvil, ocultamos los items base del sidebar */
              .sidebar-base-items {
                display: none;
              }
    
              /* Y mostramos los del navbar */
              .nav-base-items {
                display: flex;
              }
            }
    
            @media (min-width: 769px) {
              /* En desktop, ocultamos los items base del navbar */
              .nav-base-items {
                display: none;
              }
    
              /* Y mostramos los del sidebar */
              .sidebar-base-items {
                display: block;
              }
            }
          </style>
    
        
        <div class="container">
          <nav class="top-nav">
            <button class="menu-btn">☰</button>
            <div class="nav-base-items">
              <slot name="nav-base-items"></slot>
            </div>
          </nav>
  
          <div class="overlay"></div>
  
          <div class="sidebar">
            <div class="sidebar-base-items">
              <slot name="sidebar-base-items"></slot>
            </div>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <slot name="menu-items"></slot>
          </div>
  
          <div class="content">
            <slot name="main-content"></slot>
          </div>
        </div>
      `;
  
      this.menuBtn = this.shadowRoot.querySelector('.menu-btn');
      this.sidebar = this.shadowRoot.querySelector('.sidebar');
      this.overlay = this.shadowRoot.querySelector('.overlay');
  
      this.menuBtn.addEventListener('click', () => this.toggleMenu());
      this.overlay.addEventListener('click', () => this.closeMenu());
    }
  
    toggleMenu() {
      this.sidebar.classList.toggle('active');
      this.overlay.classList.toggle('active');
    }
  
    closeMenu() {
      this.sidebar.classList.remove('active');
      this.overlay.classList.remove('active');
    }
  }
  
  customElements.define('responsive-nav-sidebar', ResponsiveNavSidebar);
  class TranslateText extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.updateContent();
      document.addEventListener('languageChanged', () => this.updateContent());
    }
  
    updateContent() {
      const key = this.getAttribute('key');
      const text = TranslateText.translations[TranslateText.currentLanguage][key] || key;
      this.shadowRoot.textContent = text;
    }
  }
  
  // Definición del componente LanguageSelector mejorado
  class LanguageSelector extends HTMLElement {
    static instances = new Set();
    static STORAGE_KEY = 'selectedLanguage';
    
    // Definición de las etiquetas de idioma
    static languageLabels = {
      es: 'Español',
      en: 'English',
      fr: 'Français'
    };
  
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['id'];
    }
  
    connectedCallback() {
      LanguageSelector.instances.add(this);
      
      // Cargar el idioma guardado o usar el predeterminado
      TranslateText.currentLanguage = this.loadStoredLanguage();
      
      this.render();
      
      const select = this.shadowRoot.querySelector('select');
      
      // Establecer el valor inicial desde localStorage
      select.value = TranslateText.currentLanguage;
      
      // Agregar event listener para el cambio
      select.addEventListener('change', (e) => {
        const newLanguage = e.target.value;
        
        // Guardar en localStorage
        this.saveLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
        // Actualizar todos los selectores
        LanguageSelector.updateAllSelectors(newLanguage, this);
        
        // Actualizar el idioma global
        TranslateText.currentLanguage = newLanguage;
        
        // Disparar evento global de cambio de idioma
        document.dispatchEvent(new Event('languageChanged'));
        
        // Disparar evento personalizado en el selector
        this.dispatchEvent(new CustomEvent('languageChange', {
          detail: {
            language: newLanguage,
            selectorId: this.getAttribute('id'),
            label: LanguageSelector.languageLabels[newLanguage]
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  
    disconnectedCallback() {
      LanguageSelector.instances.delete(this);
    }
  
    // Método para guardar el idioma en localStorage
    saveLanguage(language) {
      try {
        localStorage.setItem(LanguageSelector.STORAGE_KEY, language);
      } catch (e) {
        console.warn('No se pudo guardar el idioma en localStorage:', e);
      }
    }
  
    // Método para cargar el idioma desde localStorage
    loadStoredLanguage() {
      try {
        const storedLanguage = localStorage.getItem(LanguageSelector.STORAGE_KEY);
        return storedLanguage || TranslateText.currentLanguage; // Retorna el almacenado o el predeterminado
      } catch (e) {
        console.warn('No se pudo cargar el idioma desde localStorage:', e);
        return TranslateText.currentLanguage;
      }
    }
  
    static updateAllSelectors(newLanguage, exclude = null) {
      LanguageSelector.instances.forEach(selector => {
        if (selector !== exclude) {
          selector.shadowRoot.querySelector('select').value = newLanguage;
        }
      });
    }
  
    // Método público para obtener el idioma actual
    getValue() {
      return this.shadowRoot.querySelector('select').value;
    }
  
    // Método público para obtener la etiqueta del idioma actual
    getLanguageLabel() {
      const currentLanguage = this.getValue();
      return LanguageSelector.languageLabels[currentLanguage];
    }
  
    render() {
      const style = `
        <style>
          select {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 14px;
          }
        </style>
      `;
  
      const currentId = this.getAttribute('id');
      const selectId = currentId ? `id="${currentId}-select"` : '';
  
      this.shadowRoot.innerHTML = `
        ${style}
        <select ${selectId}>
          ${Object.entries(LanguageSelector.languageLabels).map(([code, label]) => 
            `<option value="${code}">${label}</option>`
          ).join('')}
        </select>
      `;
    }
  }
  
  // Configuración global
  TranslateText.currentLanguage = localStorage.getItem('selectedLanguage') || 'es';
  TranslateText.translations = {
    es: {
      hello: 'Hola',
      world: 'Mundo',
      select1: 'Selector 1',
      select2: 'Selector 2',
      select3: 'Selector 3',
      currentLang: 'Idioma actual',
      selectedLanguage: 'Idioma seleccionado',
      config: 'configuracion',
      configuration: 'Configuración',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      delete: 'Eliminar',
      add: 'Agregar',
      edit: 'Editar',
      remove: 'Eliminar',
      select: 'Seleccionar',
      home: 'inicio',
    },
    en: {
      hello: 'Hello',
      world: 'World',
      select1: 'Selector 1',
      select2: 'Selector 2',
      select3: 'Selector 3',
      currentLang: 'Current language',
      selectedLanguage: 'Selected language',
      configuration: 'Configuration',
      config: 'configuration',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      delete: 'Delete',
      add: 'Add',
      edit: 'Edit',
      remove: 'Remove',
      select: 'Select',
      home: 'home',
    },
    fr: {
      hello: 'Bonjour',
      world: 'Monde',
      select1: 'Sélecteur 1',
      select2: 'Sélecteur 2',
      select3: 'Sélecteur 3',
      currentLang: 'Langue actuelle',
      selectedLanguage: 'Langue sélectionnée',
      configuration: 'Configuration',
      config: 'configure',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      close: 'Fermer',
      delete: 'Supprimer',
      add: 'Ajouter',
      edit: 'Modifier',
      remove: 'Supprimer',
      select: 'Sélectionner',
      home: 'home',
    }
  };
  
  // Registro de los componentes
  customElements.define('translate-text', TranslateText);
  customElements.define('language-selector', LanguageSelector);
  