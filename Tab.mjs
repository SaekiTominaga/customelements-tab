var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _mySessionStorage, _tablistElement, _tabElements, _tabpanelElements, _selectedTabNo, _tabClickEventListener, _tabKeydownEventListener, _tabpanelKeydownEventListener;
/**
 * Tab
 *
 * @example
 * <x-tab
 *   tablist-label="[Optional] Label string to set in [role=tablist]. (set as the `aria-label` attribute value)"
 *   storage-key="[Optional] When a tab is selected, its value is saved as the `sessionStorage`.">
 *   <a href="#tabpanel1" slot="tab">Tab 1</a>
 *   <a href="#tabpanel2" slot="tab">Tab 2</a>
 *   <div slot="tabpanel" id="tabpanel1">Tab panel 1</div>
 *   <div slot="tabpanel" id="tabpanel2">Tab panel 2</div>
 * </x-tab>
 *
 * @version 1.4.2
 */
export default class Tab extends HTMLElement {
    constructor() {
        super();
        _mySessionStorage.set(this, null);
        _tablistElement.set(this, void 0);
        _tabElements.set(this, []);
        _tabpanelElements.set(this, []);
        _selectedTabNo.set(this, 0); // 何番目のタブが選択されているか
        _tabClickEventListener.set(this, void 0);
        _tabKeydownEventListener.set(this, void 0);
        _tabpanelKeydownEventListener.set(this, void 0);
        try {
            __classPrivateFieldSet(this, _mySessionStorage, sessionStorage);
        }
        catch (e) {
            console.info('Storage access blocked.');
        }
        const cssString = `
			:host {
				display: block;
			}

			.tablist > slot {
				display: flex;
				align-items: flex-end;
			}

			.tabpanels ::slotted([aria-hidden="true"]) {
				display: none;
			}
		`;
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
			<div id="tablist" class="tablist" role="tablist">
				<slot id="tab-slot" name="tab"></slot>
			</div>
			<div class="tabpanels">
				<slot id="tabpanel-slot" name="tabpanel"></slot>
			</div>
		`;
        if (shadow.adoptedStyleSheets !== undefined) {
            const cssStyleSheet = new CSSStyleSheet();
            cssStyleSheet.replaceSync(cssString);
            shadow.adoptedStyleSheets = [cssStyleSheet];
        }
        else {
            /* adoptedStyleSheets 未対応環境 */
            shadow.innerHTML += `<style>${cssString}</style>`;
        }
        __classPrivateFieldSet(this, _tablistElement, this.shadowRoot?.getElementById('tablist'));
        __classPrivateFieldSet(this, _tabClickEventListener, this._tabClickEvent.bind(this));
        __classPrivateFieldSet(this, _tabKeydownEventListener, this._tabKeydownEvent.bind(this));
        __classPrivateFieldSet(this, _tabpanelKeydownEventListener, this._tabpanelKeydownEvent.bind(this));
    }
    static get observedAttributes() {
        return ['tablist-label', 'storage-key'];
    }
    connectedCallback() {
        __classPrivateFieldSet(this, _tabElements, this.shadowRoot?.getElementById('tab-slot').assignedNodes({ flatten: true }));
        __classPrivateFieldSet(this, _tabpanelElements, this.shadowRoot?.getElementById('tabpanel-slot').assignedNodes({ flatten: true }));
        const tablistLabel = this.tablistLabel;
        if (tablistLabel !== null) {
            __classPrivateFieldGet(this, _tablistElement).setAttribute('aria-label', tablistLabel);
        }
        __classPrivateFieldGet(this, _tabElements).forEach((tabElement, index) => {
            const href = tabElement.href;
            if (href === '') {
                throw new Error('Attribute: `href` is not set.');
            }
            const hash = new URL(href).hash;
            if (hash === '') {
                throw new Error('Attribute: `href` does not contain hash.');
            }
            const tabpanelElementId = decodeURIComponent(hash.substring(1));
            const tabpanelElement = document.getElementById(tabpanelElementId);
            if (tabpanelElement === null) {
                throw new Error(`Element: #${tabpanelElementId} can not found.`);
            }
            const tabElementId = this._getTabElementId(index);
            tabElement.removeAttribute('href');
            tabElement.id = tabElementId;
            tabElement.setAttribute('role', 'tab');
            tabElement.setAttribute('aria-controls', tabpanelElementId);
            tabpanelElement.setAttribute('role', 'tabpanel');
            tabpanelElement.setAttribute('aria-labelledby', tabElementId);
            tabElement.addEventListener('click', __classPrivateFieldGet(this, _tabClickEventListener), { passive: true });
            tabElement.addEventListener('keydown', __classPrivateFieldGet(this, _tabKeydownEventListener));
            tabpanelElement.addEventListener('keydown', __classPrivateFieldGet(this, _tabpanelKeydownEventListener));
        });
        if (__classPrivateFieldGet(this, _mySessionStorage) !== null) {
            const storageKey = this.storageKey;
            if (storageKey !== null) {
                const initialSelectTabpanelId = __classPrivateFieldGet(this, _mySessionStorage).getItem(storageKey); // 前回選択したタブ ID
                if (initialSelectTabpanelId !== null) {
                    const initialSelectTabpanelElement = document.getElementById(initialSelectTabpanelId);
                    if (initialSelectTabpanelElement === null) {
                        console.info(`Element: #${initialSelectTabpanelId} can not found.`);
                    }
                    else {
                        __classPrivateFieldSet(this, _selectedTabNo, __classPrivateFieldGet(this, _tabpanelElements).indexOf(initialSelectTabpanelElement));
                    }
                }
            }
        }
        this._selectTab(__classPrivateFieldGet(this, _selectedTabNo));
    }
    disconnectedCallback() {
        for (const tabElement of __classPrivateFieldGet(this, _tabElements)) {
            tabElement.removeEventListener('click', __classPrivateFieldGet(this, _tabClickEventListener));
            tabElement.removeEventListener('keydown', __classPrivateFieldGet(this, _tabKeydownEventListener));
        }
        for (const tabpanelElement of __classPrivateFieldGet(this, _tabpanelElements)) {
            tabpanelElement.removeEventListener('keydown', __classPrivateFieldGet(this, _tabpanelKeydownEventListener));
        }
    }
    attributeChangedCallback(name, _oldValue, newValue) {
        switch (name) {
            case 'tablist-label': {
                __classPrivateFieldGet(this, _tablistElement).setAttribute('aria-label', newValue);
                break;
            }
            case 'storage-key': {
                break;
            }
        }
    }
    get tablistLabel() {
        return this.getAttribute('tablist-label');
    }
    set tablistLabel(value) {
        if (value === null) {
            this.removeAttribute('tablist-label');
            return;
        }
        if (typeof value !== 'string') {
            throw new TypeError(`Only a string value can be specified for the \`tablist-label\` attribute of the <${this.localName}> element.`);
        }
        this.setAttribute('tablist-label', value);
    }
    get storageKey() {
        return this.getAttribute('storage-key');
    }
    set storageKey(value) {
        if (value === null) {
            this.removeAttribute('storage-key');
            return;
        }
        if (typeof value !== 'string') {
            throw new TypeError(`Only a string value can be specified for the \`storage-key\` attribute of the <${this.localName}> element.`);
        }
        this.setAttribute('storage-key', value);
    }
    /**
     * タブの ID 文字列を取得する
     *
     * @param {number} index - 何番目のタブか
     *
     * @returns {string} ID 文字列
     */
    _getTabElementId(index) {
        return `tab-${String(index + 1)}`;
    }
    /**
     * タブをクリックしたときの処理
     *
     * @param {MouseEvent} ev - Event
     */
    _tabClickEvent(ev) {
        this._changeTab(__classPrivateFieldGet(this, _tabElements).indexOf(ev.target));
    }
    /**
     * タブをキーボード操作したときの処理
     *
     * @param {KeyboardEvent} ev - Event
     */
    _tabKeydownEvent(ev) {
        switch (ev.key) {
            case 'ArrowLeft':
            case 'ArrowUp': {
                ev.preventDefault();
                this._changeTab(__classPrivateFieldGet(this, _selectedTabNo) < 1 ? __classPrivateFieldGet(this, _tabElements).length - 1 : __classPrivateFieldGet(this, _selectedTabNo) - 1);
                break;
            }
            case 'ArrowRight':
            case 'ArrowDown': {
                ev.preventDefault();
                this._changeTab(__classPrivateFieldGet(this, _selectedTabNo) >= __classPrivateFieldGet(this, _tabElements).length - 1 ? 0 : __classPrivateFieldGet(this, _selectedTabNo) + 1);
                break;
            }
            case 'End': {
                ev.preventDefault();
                this._changeTab(__classPrivateFieldGet(this, _tabElements).length - 1);
                break;
            }
            case 'Home': {
                ev.preventDefault();
                this._changeTab(0);
                break;
            }
        }
    }
    /**
     * タブパネルをキーボード操作したときの処理
     *
     * @param {KeyboardEvent} ev - Event
     */
    _tabpanelKeydownEvent(ev) {
        switch (ev.key) {
            case 'ArrowLeft':
            case 'ArrowUp': {
                if (ev.ctrlKey) {
                    /* Ctrl キーが同時に押下された場合は、選択中の [role="tab"] な要素にフォーカスを移動する */
                    ev.preventDefault();
                    __classPrivateFieldGet(this, _tabElements)[__classPrivateFieldGet(this, _selectedTabNo)].focus();
                }
                break;
            }
        }
    }
    /**
     * タブを選択する
     *
     * @param {number} tabNo - 選択するタブ番号
     */
    _selectTab(tabNo) {
        __classPrivateFieldGet(this, _tabElements).forEach((tabElement, index) => {
            const select = index === tabNo; // 選択されたタブかどうか
            tabElement.tabIndex = select ? 0 : -1;
            tabElement.setAttribute('aria-selected', String(select));
            tabElement.setAttribute('aria-expanded', String(select));
            __classPrivateFieldGet(this, _tabpanelElements)[index].setAttribute('aria-hidden', String(!select));
        });
        __classPrivateFieldSet(this, _selectedTabNo, tabNo);
    }
    /**
     * ユーザー操作によりタブを切り替える
     *
     * @param {number} tabNo - 切り替えるタブ番号
     */
    _changeTab(tabNo) {
        this._selectTab(tabNo);
        __classPrivateFieldGet(this, _tabElements)[tabNo].focus();
        /* 現在選択中のタブ情報をストレージに保管する */
        if (__classPrivateFieldGet(this, _mySessionStorage) !== null && this.storageKey !== null) {
            __classPrivateFieldGet(this, _mySessionStorage).setItem(this.storageKey, __classPrivateFieldGet(this, _tabpanelElements)[tabNo].id);
        }
    }
}
_mySessionStorage = new WeakMap(), _tablistElement = new WeakMap(), _tabElements = new WeakMap(), _tabpanelElements = new WeakMap(), _selectedTabNo = new WeakMap(), _tabClickEventListener = new WeakMap(), _tabKeydownEventListener = new WeakMap(), _tabpanelKeydownEventListener = new WeakMap();
