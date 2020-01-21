/**
 * タブ
 *
 * @example
 * <x-tab
 *   tablist-label="【任意】[role=tablist] に設定するラベル文字列"
 *   storage-key="【任意】選択タブをストレージに記憶する際のキー文字列（サイト内でユニークな値を設定）">
 *   <a href="#tabpanel1" slot="tab">タブ1</a>
 *   <a href="#tabpanel2" slot="tab">タブ2</a>
 *   <div slot="tabpanel" id="tabpanel1">タブパネル1</div>
 *   <div slot="tabpanel" id="tabpanel2">タブパネル2</div>
 * </x-tab>
 *
 * @version 1.3.2 2020-01-21 CSSStyleSheet へのCSSの設定を replaceSync に変更
 */
export default class Tab extends HTMLElement {
	constructor() {
		super();

		try {
			this._mySessionStorage = sessionStorage;
		} catch(e) {
			console.info('Storage access blocked.');
		}

		const cssString = `
			:host {
				display: block;
			}

			.tablist slot,
			.tablist.style-scope.w0s-tab /* for polyfill */ {
				display: flex;
				align-items: flex-end;
			}

			.tabpanels ::slotted([aria-hidden="true"]) {
				display: none;
			}
			.tabpanels.style-scope.w0s-tab > [aria-hidden="true"] /* for polyfill */ {
				display: none;
			}
		`;

		const shadow = this.attachShadow({mode: 'open'});
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
		} else {
			/* adoptedStyleSheets 未対応環境 */
			shadow.innerHTML += `<style>${cssString}</style>`;
		}

		this._tablistElement = this.shadowRoot.getElementById('tablist');
		this._tabElements = this.shadowRoot.getElementById('tab-slot').assignedNodes({flatten: true});
		this._tabpanelElements = this.shadowRoot.getElementById('tabpanel-slot').assignedNodes({flatten: true});

		this._tabClickEventListener = this._tabClickEvent.bind(this);
		this._tabKeydownEventListener = this._tabKeydownEvent.bind(this);
		this._tabpanelKeydownEventListener = this._tabpanelKeydownEvent.bind(this);
	}

	connectedCallback() {
		const tablistElement = this._tablistElement;
		const tabElements = this._tabElements;
		const tabpanelElements = this._tabpanelElements;

		for (const tabElement of tabElements) {
			tabElement.tabIndex = 0;
			tabElement.setAttribute('role', 'tab');
			tabElement.removeAttribute('href');
		}
		for (const tabpanelElement of tabpanelElements) {
			tabpanelElement.setAttribute('role', 'tabpanel');
		}

		const tablistLabel = this.getAttribute('tablist-label');
		if (tablistLabel !== null && tablistLabel !== '') {
			tablistElement.setAttribute('aria-label', tablistLabel);
		}

		const storageKey = this.getAttribute('storage-key');
		this._storageKey = storageKey;

		let selectedTabNo = 0; // 何番目のタブが選択されているか
		if (storageKey !== null) {
			try {
				const initialDisplayTabpanelId = this._mySessionStorage.getItem(storageKey); // 前回選択したタブID
				if (initialDisplayTabpanelId !== null) {
					const initialDisplayTabpanelElement = document.getElementById(initialDisplayTabpanelId);
					if (initialDisplayTabpanelElement === null) {
						console.error(`Element: #${initialDisplayTabpanelId} can not found.`);
					} else {
						selectedTabNo = tabpanelElements.indexOf(initialDisplayTabpanelElement);
					}
				}
			} catch(e) {
				/* ストレージ無効環境やプライベートブラウジング時 */
			}
		}
		this.selectedIndex = selectedTabNo;

		let tabNo = 0;
		for (const tabElement of tabElements) {
			const hrefAttribute = tabElement.href;

			tabElement.id = this._getTabId(tabNo);
			tabElement.setAttribute('aria-controls', decodeURIComponent(hrefAttribute.substring(hrefAttribute.indexOf('#') + 1)));

			tabNo++;

			tabElement.addEventListener('click', this._tabClickEventListener);
			tabElement.addEventListener('keydown', this._tabKeydownEventListener);
		}

		let tabpanelNo = 0;
		for (const tabpanelElement of tabpanelElements) {
			tabpanelElement.setAttribute('aria-labelledby', this._getTabId(tabpanelNo));

			tabpanelNo++;

			tabpanelElement.addEventListener('keydown', this._tabpanelKeydownEventListener);
		}
	}

	disconnectedCallback() {
		const tabElements = this._tabElements;
		const tabpanelElements = this._tabpanelElements;

		for (const tabElement of tabElements) {
			tabElement.removeEventListener('click', this._tabClickEventListener);
			tabElement.removeEventListener('keydown', this._tabKeydownEventListener);
		}

		for (const tabpanelElement of tabpanelElements) {
			tabpanelElement.removeEventListener('keydown', this._tabpanelKeydownEventListener);
		}
	}

	/**
	 * タブをクリックしたときの処理
	 *
	 * @param {Event} ev - Event
	 */
	_tabClickEvent(ev) {
		const tabNo = this._tabElements.indexOf(ev.target);
		this.selectedIndex = tabNo;
		this._changeTab(tabNo);
	}

	/**
	 * タブをキーボード操作したときの処理
	 *
	 * @param {Event} ev - Event
	 */
	_tabKeydownEvent(ev) {
		switch (ev.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'Left': // IE, Edge
			case 'Up': { // IE, Edge
				ev.preventDefault();

				const tabNo = this.selectedIndex < 1 ? this._tabElements.length - 1 : this.selectedIndex - 1;
				this.selectedIndex = tabNo;
				this._changeTab(tabNo);
				break;
			}
			case 'ArrowRight':
			case 'ArrowDown':
			case 'Right': // IE, Edge
			case 'Down': { // IE, Edge
				ev.preventDefault();

				const tabNo = this.selectedIndex >= this._tabElements.length - 1 ? 0 : this.selectedIndex + 1;
				this.selectedIndex = tabNo;
				this._changeTab(tabNo);
				break;
			}
			case 'End': {
				ev.preventDefault();

				const tabNo = this._tabElements.length - 1;
				this.selectedIndex = tabNo;
				this._changeTab(tabNo);
				break;
			}
			case 'Home': {
				ev.preventDefault();

				const tabNo = 0;
				this.selectedIndex = tabNo;
				this._changeTab(tabNo);
				break;
			}
		}
	}

	/**
	 * タブパネルをキーボード操作したときの処理
	 *
	 * @param {Event} ev - Event
	 */
	_tabpanelKeydownEvent(ev) {
		switch (ev.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'Left': // IE, Edge
			case 'Up': { // IE, Edge
				if (ev.ctrlKey) {
					/* Ctrlキーが同時に押下された場合は、選択中の [role="tab"] な要素にフォーカスを移動する */
					ev.preventDefault();

					this._tabElements[this.selectedIndex].focus();
				}
				break;
			}
		}
	}

	get selectedIndex() {
		return Number(this.getAttribute('selected-index'));
	}
	set selectedIndex(tabNo) {
		this.setAttribute('selected-index', tabNo);

		let i = 0;
		for (const tabElement of this._tabElements) {
			const select = i === tabNo; // 選択されたタブかどうか

			tabElement.tabIndex = select ? 0 : -1;
			tabElement.setAttribute('aria-selected', select);
			tabElement.setAttribute('aria-expanded', select);

			this._tabpanelElements[i].setAttribute('aria-hidden', !select);

			i++;
		}
	}

	/**
	 * タブのID文字列を取得する
	 *
	 * @param {number} no - タブ番号
	 *
	 * @returns {string} ID文字列
	 */
	_getTabId(no) {
		return `tab-${no + 1}`;
	}

	/**
	 * タブを切り替える
	 *
	 * @param {number} tabNo - 切り替えるタブ番号
	 */
	_changeTab(tabNo) {
		const selectedTabElement = this._tabElements[tabNo];
		const selectedTabpanelElement = this._tabpanelElements[tabNo];

		/* 当該タブにフォーカスを移す（キーボード操作時のため） */
		selectedTabElement.focus();

		/* 現在選択中のタブ情報をストレージに保管する */
		const storageKey = this._storageKey;
		if (storageKey !== null) {
			try {
				this._mySessionStorage.setItem(this._storageKey, selectedTabpanelElement.id);
			} catch(e) {
				/* ストレージ無効環境やプライベートブラウジング時 */
			}
		}
	}
}
