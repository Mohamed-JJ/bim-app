<script lang="ts" setup>
import * as BUI from "@thatopen/ui";
import { onMounted } from "vue";

const attributesRef = 

const [attributesTable, updateAttributesTable] = CUI.tables.entityAttributes({
  components,
  fragmentIdMap: {},
  tableDefinition,
  attributesToInclude: () => {
    const attributes: any[] = [
      "Name",
      "ContainedInStructure",
      "HasProperties",
      "HasPropertySets",
      (name: string) => name.includes("Value"),
      (name: string) => name.startsWith("Material"),
      (name: string) => name.startsWith("Relating"),
      (name: string) => {
        const ignore = ["IsGroupedBy", "IsDecomposedBy"];
        return name.startsWith("Is") && !ignore.includes(name);
      },
    ];
    return attributes;
  },
});
const entityAttributesPanel = BUI.Component.create<BUI.PanelSection>(() => {
  const onSearchInput = (e: Event) => {
    const input = e.target as BUI.TextInput;
    attributesTable.queryString = input.value;
  };

  const onPreserveStructureChange = (e: Event) => {
    const checkbox = e.target as BUI.Checkbox;
    attributesTable.preserveStructureOnFilter = checkbox.checked;
  };

  const onExportJSON = () => {
    attributesTable.downloadData("entities-attributes");
  };

  const onCopyTSV = async () => {
    await navigator.clipboard.writeText(attributesTable.tsv);
    alert(
      "Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app."
    );
  };

  const onAttributesChange = (e: Event) => {
    const dropdown = e.target as BUI.Dropdown;
    updateAttributesTable({
      attributesToInclude: () => {
        const attributes: any[] = [
          ...dropdown.value,
          (name: string) => name.includes("Value"),
          (name: string) => name.startsWith("Material"),
          (name: string) => name.startsWith("Relating"),
          (name: string) => {
            const ignore = ["IsGroupedBy", "IsDecomposedBy"];
            return name.startsWith("Is") && !ignore.includes(name);
          },
        ];
        return attributes;
      },
    });
  };

  return BUI.html`
      <bim-panel style="position: fixed; max-height: 70vh; top: 20px; left: 5px;">
        <bim-panel-section label="Entity fdd Attributes" fixed>
          <div style="display: flex; gap: 0.5rem; justify-content: space-between;">
            <div style="display: flex; gap: 0.5rem;">
              <bim-text-input @input=${onSearchInput} type="search" placeholder="Search" debounce="250"></bim-text-input>
              <bim-checkbox @change=${onPreserveStructureChange} label="Preserve Structure" inverted checked></bim-checkbox>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <bim-dropdown @change=${onAttributesChange} multiple>
                <bim-option label="Name" checked></bim-option> 
                <bim-option label="ContainedInStructure" checked></bim-option>
                <bim-option label="ForLayerSet"></bim-option>
                <bim-option label="LayerThickness"></bim-option>
                <bim-option label="HasProperties" checked></bim-option>
                <bim-option label="HasAssociations"></bim-option>
                <bim-option label="HasAssignments"></bim-option>
                <bim-option label="HasPropertySets" checked></bim-option>
                <bim-option label="PredefinedType"></bim-option>
                <bim-option label="Quantities"></bim-option>
                <bim-option label="ReferencedSource"></bim-option>
                <bim-option label="Identification"></bim-option>
                <bim-option label="Prefix"></bim-option>
                <bim-option label="LongName"></bim-option>
              </bim-dropdown>
              <bim-button @click=${onCopyTSV} icon="solar:copy-bold" tooltip-title="Copy TSV" tooltip-text="Copy the table contents as tab separated text values, so you can copy them into a spreadsheet."></bim-button>
              <bim-button @click=${onExportJSON} icon="ph:export-fill" tooltip-title="Export JSON" tooltip-text="Download the table contents as a JSON file."></bim-button>
            </div>
          </div>
          ${attributesTable}
        </bim-panel-section>
      </bim-panel>
    `;
});

onMounted(()=>{

})
</script>
<template></template>
<style></style>
