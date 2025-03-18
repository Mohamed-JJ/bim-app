<template>
    <div class="w-screen h-screen">
      <bim-section ref="appGrid" class="relative">
        <bim-viewport ref="viewport"></bim-viewport>
        <bim-panel ref="entityAttributesPanel" class="absolute top-0 right-0"></bim-panel>
      </bim-section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as WEBIFC from "web-ifc";
  import * as BUI from "@thatopen/ui";
  import * as OBC from "@thatopen/components";
  import * as OBCF from "@thatopen/components-front";
  import * as BUIC from "@thatopen/ui-obc";
  
  const appGrid = ref(null);
  const viewport = ref(null);
  const entityAttributesPanel = ref(null);
  
  onMounted(async () => {
    BUI.Manager.init();
  
    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();
  
    const sceneComponent = new OBC.SimpleScene(components);
    sceneComponent.setup();
    world.scene = sceneComponent;
  
    const rendererComponent = new OBC.SimpleRenderer(components, viewport.value);
    world.renderer = rendererComponent;
  
    const cameraComponent = new OBC.SimpleCamera(components);
    world.camera = cameraComponent;
    cameraComponent.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);
  
    viewport.value.addEventListener("resize", () => {
      rendererComponent.resize();
      cameraComponent.updateAspect();
    });
  
    components.init();
  
    const grids = components.get(OBC.Grids);
    grids.create(world);
  
    const ifcLoader = components.get(OBC.IfcLoader);
    await ifcLoader.setup();
    const file = await fetch("https://thatopen.github.io/engine_ui-components/resources/small.ifc");
    const buffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(buffer);
    const model = await ifcLoader.load(typedArray);
    world.scene.three.add(model);
  
    const indexer = components.get(OBC.IfcRelationsIndexer);
    await indexer.process(model);
  
    const baseStyle = { padding: "0.25rem", borderRadius: "0.25rem" };
    const tableDefinition = {
      Entity: (entity) => {
        let style = {};
        if (entity === OBC.IfcCategoryMap[WEBIFC.IFCPROPERTYSET]) {
          style = { ...baseStyle, backgroundColor: "purple", color: "white" };
        }
        if (String(entity).includes("IFCWALL")) {
          style = { ...baseStyle, backgroundColor: "green", color: "white" };
        }
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${entity}</bim-label>`;
      },
      PredefinedType: (type) => {
        const colors = ["#1c8d83", "#3c1c8d", "#386c19", "#837c24"];
        const randomIndex = Math.floor(Math.random() * colors.length);
        const backgroundColor = colors[randomIndex];
        const style = { ...baseStyle, backgroundColor, color: "white" };
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${type}</bim-label>`;
      },
      NominalValue: (value) => {
        let style = {};
        if (typeof value === "boolean" && value === false) {
          style = { ...baseStyle, backgroundColor: "#b13535", color: "white" };
        }
        if (typeof value === "boolean" && value === true) {
          style = { ...baseStyle, backgroundColor: "#18882c", color: "white" };
        }
        return BUI.html`<bim-label style=${BUI.styleMap(style)}>${value}</bim-label>`;
      },
    };
  
    const [attributesTable, updateAttributesTable] = BUIC.tables.entityAttributes({
      components,
      fragmentIdMap: {},
      tableDefinition,
      attributesToInclude: () => {
        const attributes = [
          "Name",
          "ContainedInStructure",
          "HasProperties",
          "HasPropertySets",
          (name) => name.includes("Value"),
          (name) => name.startsWith("Material"),
          (name) => name.startsWith("Relating"),
          (name) => {
            const ignore = ["IsGroupedBy", "IsDecomposedBy"];
            return name.startsWith("Is") && !ignore.includes(name);
          },
        ];
        return attributes;
      },
    });
  
    attributesTable.expanded = true;
    attributesTable.indentationInText = true;
    attributesTable.preserveStructureOnFilter = true;
  
    const highlighter = components.get(OBCF.Highlighter);
    highlighter.setup({ world });
  
    highlighter.events.select.onHighlight.add((fragmentIdMap) => {
      updateAttributesTable({ fragmentIdMap });
    });
  
    highlighter.events.select.onClear.add(() => updateAttributesTable({ fragmentIdMap: {} }));
  
    const panelContent = BUI.Component.create(() => {
      const onSearchInput = (e) => {
        const input = e.target;
        attributesTable.queryString = input.value;
      };
  
      const onPreserveStructureChange = (e) => {
        const checkbox = e.target;
        attributesTable.preserveStructureOnFilter = checkbox.checked;
      };
  
      const onExportJSON = () => {
        attributesTable.downloadData("entities-attributes");
      };
  
      const onCopyTSV = async () => {
        await navigator.clipboard.writeText(attributesTable.tsv);
        alert("Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app.");
      };
  
      const onAttributesChange = (e) => {
        const dropdown = e.target;
        updateAttributesTable({
          attributesToInclude: () => {
            const attributes = [
              ...dropdown.value,
              (name) => name.includes("Value"),
              (name) => name.startsWith("Material"),
              (name) => name.startsWith("Relating"),
              (name) => {
                const ignore = ["IsGroupedBy", "IsDecomposedBy"];
                return name.startsWith("Is") && !ignore.includes(name);
              },
            ];
            return attributes;
          },
        });
      };
  
      return BUI.html`
        <bim-panel-section label="Entity Attributes" fixed>
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
      `;
    });
  
    entityAttributesPanel.value.appendChild(panelContent);
  
    appGrid.value.layouts = {
      main: {
        template: `
          "viewport" 1fr
          "entityAttributesPanel" 1fr
        `,
        elements: { entityAttributesPanel: entityAttributesPanel.value, viewport: viewport.value },
      },
    };
  
    appGrid.value.layout = "main";
  });
  </script>
  
  <style scoped>
  /* Add any specific styles here */
  </style>