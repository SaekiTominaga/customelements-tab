# Tabs UI component by Custom Elements

[![npm version](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-tab.svg)](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-tab)

Implement tabs UI component by Custom Elements.

## Demo

- [Demo page](https://saekitominaga.github.io/customelements-tab/demo.html)

## Examples

```
<x-tab
  tablist-label="Tab label"
  storage-key="tab1">
  <a href="#tabpanel1" slot="tab">Tab 1</a>
  <a href="#tabpanel2" slot="tab">Tab 2</a>
  <div slot="tabpanel" id="tabpanel1">Tab panel 1</div>
  <div slot="tabpanel" id="tabpanel2">Tab panel 2</div>
</x-tab>
```

## Attributes

<dl>
<dt>tablist-label [optional]</dt>
<dd>Label string to set in [role=tablist]. (set as the `aria-label` attribute value)</dd>
<dt>storage-key [optional]</dt>
<dd>When a tab is selected, its value is saved as the `sessionStorage`. The selected tab is maintained when you navigate or reload the page. <strong>This value should be unique within your site because it is used as the key for `sessionStorage`.</strong> (Setting this attribute is optional, but it is recommended to set it from the viewpoint of usability.)</dd>
</dl>
