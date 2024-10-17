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