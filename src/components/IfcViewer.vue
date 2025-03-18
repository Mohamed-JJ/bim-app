<template>
  <div id="container" ref="container" class="w-screen h-screen relative">
    <div>
      <bim-panel
        active
        label="IFC Loader Tutorial"
        class="absolute top-0 right-0"
      >
        <bim-panel-section collapsed label="Controls">
          <bim-panel-section
            label="Importing"
            ref="loadIfcButton"
            class="hidden"
          >
          </bim-panel-section>
          <bim-button label="Load IFC" @click="triggerFileUpload"></bim-button>
          <input
            type="file"
            id="ifc-file-input"
            accept=".ifc"
            style="display: none"
            @change="handleFileUpload"
          />
          <bim-button label="Export GLTF" @click="exportGLTF"></bim-button>
          <bim-button
            label="Dispose fragments"
            @click="disposeFragments"
          ></bim-button>
        </bim-panel-section>
      </bim-panel>
    </div>
    <div v-if="entityAttributesPanel" ref="entityAttributesPanel"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
// import * as OBF from "@thatopen/components-front";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { FragmentsGroup } from "@thatopen/fragments";
import * as BUIC from "@thatopen/ui-obc";

// Refs
const container = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const entityAttributesPanel = ref<HTMLElement | null>(null);
const model_listRef = ref(null);
const loadIfcButton = ref();

// State

const componentsRef = ref<OBC.Components | null>(null);
const worldsRef = ref<OBC.Worlds | null>(null);
const stats = ref(new Stats());

const worldRef = ref<OBC.SimpleWorld<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBC.SimpleRenderer
> | null>(null);
const fragmentsRef = ref<OBC.FragmentsManager | null>(null);
const fragmentIfcLoaderRef = ref<OBC.IfcLoader | null>(null);
const lastModelRef = ref<FragmentsGroup | null>(null);
const metadataRef = ref<any | null>(null);

// Excluded categories
const excludedCats = [
  WEBIFC.IFCTENDONANCHOR,
  WEBIFC.IFCREINFORCINGBAR,
  WEBIFC.IFCREINFORCINGELEMENT,
];

// Setup
onMounted(async () => {
  if (!container.value) return;
  const components = new OBC.Components();

  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();
  const fragments = components.get(OBC.FragmentsManager);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);
  let lastModel: FragmentsGroup | null = null;
  let metadata: any = null;

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
  const [loadIfcBtn] = BUIC.buttons.loadIfc({ components });
  components.init();
  world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
  world.scene.setup();

  const grids = components.get(OBC.Grids);
  grids.create(world);
  world.scene.three.background = null;

  await fragmentIfcLoader.setup();
  excludedCats.forEach((cat) =>
    fragmentIfcLoader.settings.excludedCategories.add(cat)
  );
  fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

  // Stats.js setup
  stats.value.showPanel(2);
  document.body.append(stats.value.dom);
  stats.value.dom.style.left = "0px";
  stats.value.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.value.begin());
  world.renderer.onAfterUpdate.add(() => stats.value.end());

  // Load IFC
  await loadIfc();

  // Create UI panels
  // if (panel.value) panel.value.append(createPanel());
  if (entityAttributesPanel.value)
    entityAttributesPanel.value.append(createEntityAttributesPanel(components));

  loadIfcButton.value.appendChild(loadIfcBtn);

  componentsRef.value = components;
  worldsRef.value = worlds;
  worldRef.value = world;
  fragmentsRef.value = fragments;
  fragmentIfcLoaderRef.value = fragmentIfcLoader;
});

// Functions
async function loadIfc() {
  const file = await fetch("ifc/archi.ifc");
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = await fragmentIfcLoaderRef.value?.load(buffer);
  console.log("the model is:", model);
  worldRef.value?.scene.three.add(model!);
  lastModelRef.value = model!;
  metadataRef.value = model!.getLocalProperties();
  console.log("[INIT Load] metadata:", metadataRef.value);
  console.log("[INIT Load] model:", lastModelRef.value);
}

function triggerFileUpload() {
  const fileInput = document.getElementById("ifc-file-input");
  if (fileInput) {
    console.log("clicked");
    fileInput.click();
  }
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  console.log(file);
  if (!file) {
    alert("No file selected!");
    return;
  }

  try {
    const data = await readFile(file);
    console.log("here1");

    const buffer = new Uint8Array(data);
    console.log("here2", buffer);

    const model = await fragmentIfcLoaderRef.value?.load(buffer);
    console.log("here3", model);

    worldRef.value?.scene.three.add(model!);
    console.log("here4");
    await setupEntityAttributes(model);
    console.log("here5");

    if (model) {
      metadataRef.value = model.getLocalProperties();
      console.log("here6");
    }

    lastModelRef.value = model;
    console.log("here7", model);

    console.log("[INIT Load] metadata:", metadataRef.value);
    console.log("[INIT Load] model:", lastModelRef.value);
  } catch (error) {
    console.error("Error loading IFC file:", error);
    alert("Failed to load IFC file.");
  }
}

async function exportGLTF() {
  if (!lastModelRef.value) return;

  const exporter = new GLTFExporter();
  exporter.parse(
    worldRef.value!.scene.three,
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
  fragmentsRef.value?.dispose();
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
  const indexer = componentsRef.value?.get(OBC.IfcRelationsIndexer);
  await indexer?.process(model);
}

// function createPanel() {
//   return BUI.Component.create<BUI.PanelSection>(() => {
//     return BUI.html`
//       <bim-panel active label="IFC Loader Tutorial" class="options-menu absolute right-0 top-0">
//         <bim-panel-section collapsed label="Controls">
//           <bim-button label="Load IFC" @click="${triggerFileUpload}"></bim-button>
//           <input type="file" id="ifc-file-input" accept=".ifc" style="display: none;" @change="${handleFileUpload}" />
//           <bim-button label="Export GLTF" @click="${exportGLTF}"></bim-button>
//           <bim-button label="Dispose fragments" @click="${disposeFragments}"></bim-button>
//         </bim-panel-section>
//       </bim-panel>
//     `;
//   });
// }

function createEntityAttributesPanel(components: OBC.Components) {
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
