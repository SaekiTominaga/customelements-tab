/**
 * Tab
 */
export default class Tab extends HTMLElement {
    #private;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _oldValue: string, newValue: string): void;
    get tablistLabel(): string | null;
    set tablistLabel(value: string | null);
    get storageKey(): string | null;
    set storageKey(value: string | null);
    /**
     * タブの ID 文字列を取得する
     *
     * @param {number} index - 何番目のタブか
     *
     * @returns {string} ID 文字列
     */
    private _getTabElementId;
    /**
     * タブをクリックしたときの処理
     *
     * @param {MouseEvent} ev - Event
     */
    private _tabClickEvent;
    /**
     * タブをキーボード操作したときの処理
     *
     * @param {KeyboardEvent} ev - Event
     */
    private _tabKeydownEvent;
    /**
     * タブパネルをキーボード操作したときの処理
     *
     * @param {KeyboardEvent} ev - Event
     */
    private _tabpanelKeydownEvent;
    /**
     * タブを選択する
     *
     * @param {number} tabNo - 選択するタブ番号
     */
    private _selectTab;
    /**
     * ユーザー操作によりタブを切り替える
     *
     * @param {number} tabNo - 切り替えるタブ番号
     */
    private _changeTab;
}
//# sourceMappingURL=Tab.d.ts.map