# Tabs UI component by Custom Elements

[![npm version](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-tab.svg)](https://badge.fury.io/js/%40saekitominaga%2Fcustomelements-tab)

Implement tabs UI component by Custom Elements.

## Demo

- [Demo page](https://saekitominaga.github.io/customelements-tab/demo.html)

## Attributes

<dl>
<dt>tablist-label [optional]</dt>
<dd>Label string to set in [role=tablist]. (set as the `aria-label` attribute value)</dd>
<dt>storage-key [optional]</dt>
<dd>When a tab is selected, its value is saved as the `sessionStorage`. The selected tab is maintained when you navigate or reload the page. <strong>This value should be unique within your site because it is used as the key for `sessionStorage`.</strong> (Setting this attribute is optional, but it is recommended to set it from the viewpoint of usability.)</dd>
</dl>
