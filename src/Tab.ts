/**
 * Tab
 *
 * @version 1.5.0
 */
export default class Tab extends HTMLElement {
	#mySessionStorage: Storage | null = null;

	#tablistElement: HTMLElement;
	#tabElements: HTMLAnchorElement[] = [];
	#tabpanelElements: HTMLElement[] = [];

	#selectedTabNo = 0; // 何番目のタブが選択されているか

	#tabClickEventListener: (ev: MouseEvent) => void;
	#tabKeydownEventListener: (ev: KeyboardEvent) => void;
	#tabpanelKeydownEventListener: (ev: KeyboardEvent) => void;

	static get observedAttributes(): string[] {
		return ['tablist-label', 'storage-key'];
	}

	constructor() {
		super();

		try {
			this.#mySessionStorage = sessionStorage;
		} catch (e) {
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
		} else {
			/* adoptedStyleSheets 未対応環境 */
			shadow.innerHTML += `<style>${cssString}</style>`;
		}

		this.#tablistElement = <HTMLElement>this.shadowRoot?.getElementById('tablist');

		this.#tabClickEventListener = this._tabClickEvent.bind(this);
		this.#tabKeydownEventListener = this._tabKeydownEvent.bind(this);
		this.#tabpanelKeydownEventListener = this._tabpanelKeydownEvent.bind(this);
	}

	connectedCallback(): void {
		this.#tabElements = <HTMLAnchorElement[]>(<HTMLSlotElement>this.shadowRoot?.getElementById('tab-slot')).assignedNodes({ flatten: true });
		this.#tabpanelElements = <HTMLElement[]>(<HTMLSlotElement>this.shadowRoot?.getElementById('tabpanel-slot')).assignedNodes({ flatten: true });

		const tablistLabel = this.tablistLabel;
		if (tablistLabel !== null) {
			this.#tablistElement.setAttribute('aria-label', tablistLabel);
		}

		this.#tabElements.forEach((tabElement, index) => {
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

			tabElement.addEventListener('click', this.#tabClickEventListener, { passive: true });
			tabElement.addEventListener('keydown', this.#tabKeydownEventListener);
			tabpanelElement.addEventListener('keydown', this.#tabpanelKeydownEventListener);
		});

		if (this.#mySessionStorage !== null) {
			const storageKey = this.storageKey;
			if (storageKey !== null) {
				const initialSelectTabpanelId = this.#mySessionStorage.getItem(storageKey); // 前回選択したタブ ID
				if (initialSelectTabpanelId !== null) {
					const initialSelectTabpanelElement = document.getElementById(initialSelectTabpanelId);
					if (initialSelectTabpanelElement === null) {
						console.info(`Element: #${initialSelectTabpanelId} can not found.`);
					} else {
						this.#selectedTabNo = this.#tabpanelElements.indexOf(initialSelectTabpanelElement);
					}
				}
			}
		}

		this._selectTab(this.#selectedTabNo);
	}

	disconnectedCallback(): void {
		for (const tabElement of this.#tabElements) {
			tabElement.removeEventListener('click', this.#tabClickEventListener);
			tabElement.removeEventListener('keydown', this.#tabKeydownEventListener);
		}

		for (const tabpanelElement of this.#tabpanelElements) {
			tabpanelElement.removeEventListener('keydown', this.#tabpanelKeydownEventListener);
		}
	}

	attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
		switch (name) {
			case 'tablist-label': {
				this.#tablistElement.setAttribute('aria-label', newValue);

				break;
			}
			case 'storage-key': {
				break;
			}
		}
	}

	get tablistLabel(): string | null {
		return this.getAttribute('tablist-label');
	}
	set tablistLabel(value: string | null) {
		if (value === null) {
			this.removeAttribute('tablist-label');
			return;
		}

		if (typeof value !== 'string') {
			throw new TypeError(`Only a string value can be specified for the \`tablist-label\` attribute of the <${this.localName}> element.`);
		}

		this.setAttribute('tablist-label', value);
	}

	get storageKey(): string | null {
		return this.getAttribute('storage-key');
	}
	set storageKey(value: string | null) {
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
	private _getTabElementId(index: number): string {
		return `tab-${String(index + 1)}`;
	}

	/**
	 * タブをクリックしたときの処理
	 *
	 * @param {MouseEvent} ev - Event
	 */
	private _tabClickEvent(ev: MouseEvent): void {
		this._changeTab(this.#tabElements.indexOf(<HTMLAnchorElement>ev.currentTarget));
	}

	/**
	 * タブをキーボード操作したときの処理
	 *
	 * @param {KeyboardEvent} ev - Event
	 */
	private _tabKeydownEvent(ev: KeyboardEvent): void {
		switch (ev.key) {
			case 'ArrowLeft':
			case 'ArrowUp': {
				ev.preventDefault();

				this._changeTab(this.#selectedTabNo < 1 ? this.#tabElements.length - 1 : this.#selectedTabNo - 1);

				break;
			}
			case 'ArrowRight':
			case 'ArrowDown': {
				ev.preventDefault();

				this._changeTab(this.#selectedTabNo >= this.#tabElements.length - 1 ? 0 : this.#selectedTabNo + 1);

				break;
			}
			case 'End': {
				ev.preventDefault();

				this._changeTab(this.#tabElements.length - 1);

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
	private _tabpanelKeydownEvent(ev: KeyboardEvent): void {
		switch (ev.key) {
			case 'ArrowLeft':
			case 'ArrowUp': {
				if (ev.ctrlKey) {
					/* Ctrl キーが同時に押下された場合は、選択中の [role="tab"] な要素にフォーカスを移動する */
					ev.preventDefault();

					this.#tabElements[this.#selectedTabNo].focus();
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
	private _selectTab(tabNo: number): void {
		this.#tabElements.forEach((tabElement, index) => {
			const select = index === tabNo; // 選択されたタブかどうか

			tabElement.tabIndex = select ? 0 : -1;
			tabElement.setAttribute('aria-selected', String(select));
			tabElement.setAttribute('aria-expanded', String(select));

			this.#tabpanelElements[index].setAttribute('aria-hidden', String(!select));
		});

		this.#selectedTabNo = tabNo;
	}

	/**
	 * ユーザー操作によりタブを切り替える
	 *
	 * @param {number} tabNo - 切り替えるタブ番号
	 */
	private _changeTab(tabNo: number): void {
		this._selectTab(tabNo);

		this.#tabElements[tabNo].focus();

		/* 現在選択中のタブ情報をストレージに保管する */
		if (this.#mySessionStorage !== null && this.storageKey !== null) {
			this.#mySessionStorage.setItem(this.storageKey, this.#tabpanelElements[tabNo].id);
		}
	}
}
