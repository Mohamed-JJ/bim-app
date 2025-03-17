<template>
  <div id="container" ref="container"></div>
  <div v-if="panel" ref="panel"></div>
  <div v-if="entityAttributesPanel" ref="entityAttributesPanel"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import * as OBF from "@thatopen/components-front";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { FragmentsGroup } from "@thatopen/fragments";

// Refs
const container = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const entityAttributesPanel = ref<HTMLElement | null>(null);

// State
const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>();
const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);
const stats = new Stats();
let lastModel: FragmentsGroup | null = null;
let metadata: any = null;

// Excluded categories
const excludedCats = [
  WEBIFC.IFCTENDONANCHOR,
  WEBIFC.IFCREINFORCINGBAR,
  WEBIFC.IFCREINFORCINGELEMENT,
];

// Setup
onMounted(async () => {
  if (!container.value) return;

  // Initialize components
  BUI.Manager.init();
  const rendererComponent = new OBC.SimpleRenderer(components, container.value);
  const cameraComponent = new OBC.SimpleCamera(components);
  world.scene = new OBC.SimpleScene(components);
  world.renderer = rendererComponent;
  world.camera = cameraComponent;

  window.addEventListener("resize", () => {
    rendererComponent.resize();
    cameraComponent.updateAspect();
  });

  components.init();
  world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
  world.scene.setup();

  const grids = components.get(OBC.Grids);
  grids.create(world);
  world.scene.three.background = null;

  await fragmentIfcLoader.setup();
  excludedCats.forEach((cat) => fragmentIfcLoader.settings.excludedCategories.add(cat));
  fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  // Stats.js setup
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  // Load IFC
  await loadIfc();

  // Create UI panels
  if (panel.value) panel.value.append(createPanel());
  if (entityAttributesPanel.value) entityAttributesPanel.value.append(createEntityAttributesPanel());
});

// Functions
async function loadIfc() {
  const file = await fetch("ifc/archi.ifc");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoader.load(buffer);
  world.scene.three.add(model);
  lastModel = model;
  metadata = model.getLocalProperties();
  console.log("[INIT Load] metadata:", metadata);
  console.log("[INIT Load] model:", lastModel);
}

function triggerFileUpload() {
  const fileInput = document.getElementById("ifc-file-input");
  if (fileInput) fileInput.click();
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) {
    alert("No file selected!");
    return;
  }

  try {
    const data = await readFile(file);
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    world.scene.three.add(model);
    await setupEntityAttributes(model);
    metadata = model.getLocalProperties();
    lastModel = model;
    console.log("[INIT Load] metadata:", metadata);
    console.log("[INIT Load] model:", lastModel);
  } catch (error) {
    console.error("Error loading IFC file:", error);
    alert("Failed to load IFC file.");
  }
}

async function exportGLTF() {
  if (!lastModel) return;

  const exporter = new GLTFExporter();
  exporter.parse(
    world.scene.three,
    (gltf) => {
      if (gltf instanceof ArrayBuffer) {
        const glbBlob = new Blob([gltf], { type: "model/gltf-binary" });
        downloadFile(glbBlob, "model.glb");
      }
    },
    (err) => console.error("[EXPORT GLTF ERR]", err),
    { trs: true, binary: true }
  );
}

function disposeFragments() {
  fragments.dispose();
}

function downloadFile(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

async function setupEntityAttributes(model: FragmentsGroup) {
  const indexer = components.get(OBC.IfcRelationsIndexer);
  await indexer.process(model);
}

function createPanel() {
  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel active label="IFC Loader Tutorial" class="options-menu">
        <bim-panel-section collapsed label="Controls">
          <bim-button label="Load IFC" @click="${triggerFileUpload}"></bim-button>
          <input type="file" id="ifc-file-input" accept=".ifc" style="display: none;" @change="${handleFileUpload}" />
          <bim-button label="Export GLTF" @click="${exportGLTF}"></bim-button>
          <bim-button label="Dispose fragments" @click="${disposeFragments}"></bim-button>
        </bim-panel-section>
      </bim-panel>
    `;
  });
}

function createEntityAttributesPanel() {
  const [attributesTable, updateAttributesTable] = CUI.tables.entityAttributes({
    components,
    fragmentIdMap: {},
    tableDefinition: {},
    attributesToInclude: () => [
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
    ],
  });

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-panel style="position: fixed; max-height: 70vh; top: 20px; left: 5px;">
        <bim-panel-section label="Entity Attributes" fixed>
          ${attributesTable}
        </bim-panel-section>
      </bim-panel>
    `;
  });
}
</script>

<style>
#container {
  width: 100%;
  height: 100vh;
}
</style>