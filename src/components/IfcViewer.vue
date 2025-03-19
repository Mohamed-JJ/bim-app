<template>
  <div class="w-screen h-screen">
    <div id="container" ref="container" class="relative w-full h-full">
      <!-- BIM Panel for IFC Models -->
      <bim-panel label="IFC Models" class="absolute top-0 left-0">
        <bim-panel-section label="Custom Importing">
          <NButton text-color="white" color="#2e3338" @click="triggerFileUpload">
            Load IFC
            <input
              type="file"
              id="ifc-file-input"
              accept=".ifc"
              style="display: none"
              @change="handleFileUpload"
            />
          </NButton>
        </bim-panel-section>
        <bim-panel-section label="Sample Model">
          <NButton text-color="white" color="#2e3338" @click="loadSampleModel">
            Load Sample Model
          </NButton>
        </bim-panel-section>
        <bim-panel-section icon="mage:box-3d-fill" label="Loaded Models">
          <div ref="modelsList"></div>
        </bim-panel-section>
        <bim-panel-section>
          <NButton @click="exportGLTF" text-color="white" color="#2e3338">
            Export GLTF
          </NButton>
        </bim-panel-section>
        <bim-panel-section>
          <NButton @click="disposeFragements" text-color="white" color="#2e3338">
            Dispose Fragements
          </NButton>
        </bim-panel-section>
      </bim-panel>
      
      <!-- Entity Attributes Panel -->
      <bim-panel class="absolute top-0 right-0">
        <bim-panel-section label="Entity Attributes" fixed>
          <div style="display: flex; gap: 0.5rem; justify-content: space-between;">
            <div style="display: flex; gap: 0.5rem;">
              <bim-text-input 
                @input="onSearchInput" 
                type="search" 
                placeholder="Search" 
                debounce="250"
              ></bim-text-input>
              <bim-checkbox 
                @change="onPreserveStructureChange" 
                label="Preserve Structure" 
                inverted 
                :checked="preserveStructure"
              ></bim-checkbox>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <bim-dropdown @change="onAttributesChange" multiple>
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
              <bim-button @click="onCopyTSV" icon="solar:copy-bold" tooltip-title="Copy TSV" tooltip-text="Copy the table contents as tab separated text values, so you can copy them into a spreadsheet."></bim-button>
              <bim-button @click="onExportJSON" icon="ph:export-fill" tooltip-title="Export JSON" tooltip-text="Download the table contents as a JSON file."></bim-button>
            </div>
          </div>
          <div ref="attributesTableContainer"></div>
        </bim-panel-section>
      </bim-panel>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { NButton } from "naive-ui";

// Utility functions
const downloadFile = (blob, fileName) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

const triggerFileUpload = () => {
  document.getElementById('ifc-file-input').click();
};

// Refs for DOM elements
const container = ref(null);
const modelsList = ref(null);
const attributesTableContainer = ref(null);

// Entity panel state
const preserveStructure = ref(true);

// ThatOpen BIM variables and dependencies
const componentsRef = ref(null);
const worldRef = ref(null);
const highlighterRef = ref(null);
const last_modelRef = ref(null);
const attributesTableRef = ref(null);
const updateAttributesTableRef = ref(null);
const fragementsManagerRef = ref(null)

// Entity attributes panel methods
const onSearchInput = (e) => {
  if (attributesTableRef.value) {
    attributesTableRef.value.queryString = e.target.value;
  }
};

const disposeFragements =() => {
  fragementsManagerRef.value.dispose()
}

const onPreserveStructureChange = (e) => {
  preserveStructure.value = e.target.checked;
  if (attributesTableRef.value) {
    attributesTableRef.value.preserveStructureOnFilter = preserveStructure.value;
  }
};

const onExportJSON = () => {
  if (attributesTableRef.value) {
    attributesTableRef.value.downloadData("entities-attributes");
  }
};

const onCopyTSV = async () => {
  if (attributesTableRef.value) {
    await navigator.clipboard.writeText(attributesTableRef.value.tsv);
    alert("Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app.");
  }
};

const onAttributesChange = (e) => {
  if (updateAttributesTableRef.value) {
    updateAttributesTableRef.value({
      attributesToInclude: () => {
        const attributes = [
          ...e.target.value,
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
  }
};

// Handle file upload
async function handleFileUpload(event) {
  const file = event?.target?.files[0];
  if (!file) {
    alert("No file selected!");
    return;
  }

  try {
    const data = await readFile(file);
    const buffer = new Uint8Array(data);
    await loadIFCModel(buffer, file.name);
  } catch (error) {
    console.error("Error loading IFC file:", error);
    alert("Failed to load IFC file.");
  }
}

// Load sample model
async function loadSampleModel() {
  try {
    const file = await fetch("https://thatopen.github.io/engine_ui-components/resources/small.ifc");
    const buffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(buffer);
    await loadIFCModel(typedArray, "sample.ifc");
  } catch (error) {
    console.error("Error loading sample IFC file:", error);
    alert("Failed to load sample IFC file.");
  }
}

// Common function to load IFC models
async function loadIFCModel(buffer, name) {
  const ifcLoader = componentsRef.value.get(OBC.IfcLoader);
  const model = await ifcLoader.load(buffer, { name });
  worldRef.value.scene.three.add(model);

  // Process entity relations
  await setupEntityAttributes(model);
  
  last_modelRef.value = model;
}

// Setup entity attributes
async function setupEntityAttributes(model) {
  const indexer = componentsRef.value.get(OBC.IfcRelationsIndexer);
  await indexer.process(model);
}

// Export to GLTF
const exportGLTF = () => {
  if (!last_modelRef.value) {
    alert("No model loaded to export!");
    return;
  }

  const exporter = new GLTFExporter();
  
  exporter.parse(
    worldRef.value.scene.three,
    (gltf) => {
      if (gltf instanceof ArrayBuffer) {
        const glbBlob = new Blob([gltf], { type: "model/gltf-binary" });
        downloadFile(glbBlob, "model.glb");
      }
    },
    (err) => {
      console.error("Error exporting GLTF:", err);
      alert("Failed to export model.");
    },
    {
      trs: true,
      binary: true,
    }
  );
};

// Initialize the 3D scene and UI
onMounted(async () => {
  // Initialize the UI library
  BUI.Manager.init();

  // Set up the components
  const components = new OBC.Components();

  // Set up the scene
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create();

  const sceneComponent = new OBC.SimpleScene(components);
  sceneComponent.setup();
  world.scene = sceneComponent;

  const rendererComponent = new OBC.SimpleRenderer(components, container.value);
  world.renderer = rendererComponent;

  const cameraComponent = new OBC.SimpleCamera(components);
  world.camera = cameraComponent;
  world.camera.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

  // Handle window resize
  window.addEventListener("resize", () => {
    rendererComponent.resize();
    cameraComponent.updateAspect();
  });

  // Add a grid to the scene
  const viewerGrids = components.get(OBC.Grids);
  viewerGrids.create(world);

  // Initialize components
  components.init();

  // Set up the IFC loader
  const ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup();

  // Set up the fragments manager
  const fragmentsManager = components.get(OBC.FragmentsManager);
  fragmentsManager.onFragmentsLoaded.add((model) => {
    if (world.scene) {
      world.scene.three.add(model);
    }
  });

  // Create the models list component
  const [modelsListElement] = BUIC.tables.modelsList({
    components,
    tags: { schema: true, viewDefinition: false },
    actions: { download: false },
  });

  // Append the models list to the DOM
  modelsList.value.appendChild(modelsListElement);

  // Configure entity attributes panel
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

  // Configure table
  attributesTable.expanded = true;
  attributesTable.indentationInText = true;
  attributesTable.preserveStructureOnFilter = preserveStructure.value;
  
  // Add to the DOM
  attributesTableContainer.value.appendChild(attributesTable);
  
  // Store reference to the table
  attributesTableRef.value = attributesTable;
  updateAttributesTableRef.value = updateAttributesTable;

  // Setup highlighter
  const highlighter = components.get(OBCF.Highlighter);
  highlighter.setup({ world });

  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    updateAttributesTable({ fragmentIdMap });
  });

  highlighter.events.select.onClear.add(() => updateAttributesTable({ fragmentIdMap: {} }));

  // Store references
  componentsRef.value = components;
  fragementsManagerRef.value = fragmentsManager
  worldRef.value = world;
  highlighterRef.value = highlighter;
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>