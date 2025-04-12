<template>
  <div class="w-screen h-screen">
    <div id="container" ref="container" class="relative w-full h-full">
      <!-- Control Panel -->
      <div class="absolute top-0 left-0 text-black bg-white rounded-md">
        <n-collapse arrow-placement="right" class="p-3">
          <n-collapse-item title="Control Panel">
            <n-collapse arrow-placement="right" class="p-3">
              <!-- IFC Model Loading Section -->
              <n-collapse-item title="Load IFC Models" name="1">
                <div>
                  <n-button
                    text-color="white"
                    color="#2e3338"
                    @click="triggerFileUpload"
                  >
                    Load IFC
                    <input
                      type="file"
                      id="ifc-file-input"
                      accept=".ifc"
                      style="display: none"
                      @change="handleFileUpload"
                    />
                  </n-button>
                </div>
              </n-collapse-item>

              <!-- Sample Model Section -->
              <n-collapse-item title="Load Sample Model" name="2">
                <div>
                  <n-button
                    text-color="white"
                    color="#2e3338"
                    @click="loadSampleModel"
                  >
                    Load Sample Model
                  </n-button>
                </div>
              </n-collapse-item>

              <!-- Models List Section -->
              <n-collapse-item title="Models List" name="3">
                <div class="text-black w-full border-2 border-white">
                  <div v-if="loadedModels.length === 0">
                    <p>No loaded models yet</p>
                  </div>
                  <div
                    v-else
                    v-for="(model, key) in loadedModels"
                    :key="key"
                    class="text-black flex gap-3 items-center py-2 px-3 rounded-md hover:bg-gray-200 duration-200"
                  >
                    {{ model.uuid }}
                    <button
                      class="flex items-center justify-center rounded-md hover:cursor-pointer hover:scale-125 duration-200"
                      @click="() => toggleModelVisibility(model)"
                    >
                      <n-icon v-if="model.visible" size="20">
                        <EyeOffOutline />
                      </n-icon>
                      <n-icon v-else size="20">
                        <EyeOutline />
                      </n-icon>
                    </button>
                    <button
                      class="flex items-center justify-center rounded-md hover:cursor-pointer hover:scale-125 duration-200"
                      @click="() => removeModel(model, key)"
                    >
                      <n-icon size="20">
                        <TrashBin />
                      </n-icon>
                    </button>
                  </div>
                </div>
              </n-collapse-item>

              <!-- Export and Dispose Sections -->
              <n-collapse-item title="Export GLTF" name="4">
                <div>
                  <n-button
                    @click="exportGLTF"
                    text-color="white"
                    color="#2e3338"
                  >
                    Export GLTF
                  </n-button>
                </div>
              </n-collapse-item>
              <n-collapse-item title="Dispose Fragments" name="5">
                <div>
                  <n-button
                    @click="disposeAllFragments"
                    text-color="white"
                    color="#2e3338"
                  >
                    Dispose Fragments
                  </n-button>
                </div>
              </n-collapse-item>
            </n-collapse>
          </n-collapse-item>
        </n-collapse>
      </div>

      <!-- Entity Attributes Panel -->
      <div :class="{ hidden: !showEntityPanel }">
        <div
          class="absolute top-0 right-0 bg-white rounded-md flex gap-3 p-2 overflow-auto"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-center gap-3">
              <p class="text-center font-semibold">Entity Attributes</p>
              <n-icon size="15">
                <ChevronForward />
              </n-icon>
            </div>
            <div
              style="display: flex; gap: 0.5rem; justify-content: space-between"
            >
              <div class="flex gap-2 items-center grow">
                <n-icon size="20">
                  <SearchIcon />
                </n-icon>
                <n-input
                  @update:value="handleSearch"
                  type="text"
                  placeholder="Search"
                  size="small"
                >
                </n-input>
                <n-checkbox
                  @update:checked="handlePreserveStructureChange"
                  v-model:checked="preserveStructure"
                >
                  <p class="truncate">Preserve structure</p>
                </n-checkbox>
              </div>
              <div class="flex gap-2 items-center">
                <bim-dropdown @change="handleAttributesChange" multiple>
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
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button @click="copyTableAsTSV">
                      <n-icon size="20">
                        <CopyIcon />
                      </n-icon>
                    </n-button>
                  </template>
                  <h1 class="font-semibold">Copy TSV</h1>
                  <p>
                    Copy the table contents as tab separated text values, so you
                    can copy them into a spreadsheet.
                  </p>
                </n-tooltip>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button @click="exportTableAsJSON">
                      <n-icon size="20">
                        <DownloadIcon />
                      </n-icon>
                    </n-button>
                  </template>
                  <h1 class="font-semibold">Export JSON</h1>
                  <p>Download the table contents as a JSON file.</p>
                </n-tooltip>
              </div>
            </div>
            <n-collapse arrow-placement="right" class="p-3">
              <div>
                <span>Entity</span>
                <span>Name</span>
                <span>PredefinedType</span>
                <span>longName</span>
                <span>NominalValue</span>
                <span>LayerThickness</span>
              </div>
              <div v-for="(value, key) in propsListsRef" :key="key">
                <n-collapse-item :title="value.name">
                  <div v-for="(val, ky) in value.singleValues" :key="ky" class="flex gap-3 w-full h-full">
                    <span>{{ val.Name.value }}</span>
                    <span>{{ val.NominalValue.value }}</span>
                    <span></span>
                         
                  </div>
                </n-collapse-item>
              </div>
            </n-collapse>
            <div ref="attributesTableContainer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, onMounted } from "vue";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import {
  NCollapse,
  NCollapseItem,
  NInput,
  NIcon,
  NCheckbox,
  NButton,
  NTooltip
} from "naive-ui";
import {
  EyeOffOutline,
  TrashBin,
  EyeOutline,
  SearchOutline as SearchIcon,
  CopyOutline as CopyIcon,
  DownloadOutline as DownloadIcon,
  ChevronForward
} from "@vicons/ionicons5";
import { getElementValue } from "@thatopen/ui";

// ===============================================================
// STATE MANAGEMENT
// ===============================================================

// DOM references
const container = ref(null);
const attributesTableContainer = ref(null);

// UI state
const preserveStructure = ref(true);
const showEntityPanel = ref(false);
const loadedModels = ref([]);
const propertySets = ref([]);
const uiTree = ref([]);

// logic state
const isProcessed = ref(false);

// BIM components
const components = ref(null);
const world = ref(null);
const highlighter = ref(null);
const lastModel = ref(null);
const attributesTable = ref(null);
const updateAttributesTable = ref(null);
const fragmentsManager = ref(null);
const attributesRef = ref([]);
const propsListsRef = ref([]);

// ===============================================================
// UTILITY FUNCTIONS
// ===============================================================

const downloadFile = (blob, fileName) => {
  const link = document.createElement("a");
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

// ===============================================================
// EVENT HANDLERS
// ===============================================================

const triggerFileUpload = () => {
  document.getElementById("ifc-file-input").click();
};

const toggleModelVisibility = (model) => {
  model.visible = !model.visible;
};

const handleSearch = (value) => {
  if (attributesTable.value) {
    attributesTable.value.queryString = value;
  }
};

const handlePreserveStructureChange = (checked) => {
  if (attributesTable.value) {
    attributesTable.value.preserveStructureOnFilter = checked;
  }
};

const copyTableAsTSV = async () => {
  if (attributesTable.value) {
    await navigator.clipboard.writeText(attributesTable.value.tsv);
    alert(
      "Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app."
    );
  }
};

const exportTableAsJSON = () => {
  if (attributesTable.value) {
    attributesTable.value.downloadData("entities-attributes");
  }
};

const handleAttributesChange = (e) => {
  if (updateAttributesTable.value) {
    updateAttributesTable.value({
      attributesToInclude: () => {
        const attributes = [
          ...e.target.value,
          (name) => name.includes("Value"),
          (name) => name.startsWith("Material"),
          (name) => name.startsWith("Relating"),
          (name) => {
            const ignore = ["IsGroupedBy", "IsDecomposedBy"];
            return name.startsWith("Is") && !ignore.includes(name);
          }
        ];
        attributesRef.value = attributes;
        return attributes;
      }
    });
  }
};

// ===============================================================
// IFC MODEL HANDLING
// ===============================================================

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

async function loadSampleModel() {
  try {
    const file = await fetch(
      "https://thatopen.github.io/engine_ui-components/resources/small.ifc"
    );
    const buffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(buffer);
    await loadIFCModel(typedArray, "sample.ifc");
  } catch (error) {
    console.error("Error loading sample IFC file:", error);
    alert("Failed to load sample IFC file.");
  }
}

async function loadModelFromURL(url) {
  try {
    const file = await fetch(url);
    const ifcUuid = uuidv4();
    const buffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(buffer);
    await loadIFCModel(typedArray, `${ifcUuid}.ifc`);
  } catch (error) {
    console.error("Error loading IFC file from URL:", error);
    alert("Failed to load IFC file from URL.");
  }
}

async function loadIFCModel(buffer, name) {
  const ifcLoader = components.value.get(OBC.IfcLoader);
  const model = await ifcLoader.load(buffer, { name });
  world.value.scene.three.add(model);

  // Process entity relations
  await setupEntityAttributes(model);

  lastModel.value = model;
}

async function setupEntityAttributes(model) {
  const indexer = components.value.get(OBC.IfcRelationsIndexer);
  await indexer.process(model);
}

function removeModel(model, index) {
  fragmentsManager.value.disposeGroup(model);
  loadedModels.value = loadedModels.value.filter((_, i) => i !== index);
}

function disposeAllFragments() {
  fragmentsManager.value.dispose();
  showEntityPanel.value = false;
  loadedModels.value = [];
}

// ===============================================================
// EXPORT FUNCTIONALITY
// ===============================================================

const exportGLTF = () => {
  if (!lastModel.value) {
    alert("No model loaded to export!");
    return;
  }

  const exporter = new GLTFExporter();

  exporter.parse(
    world.value.scene.three,
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
      binary: true
    }
  );
};

// ===============================================================
// data preparation
// ===============================================================

async function prepareData(model, indexer, node) {
  try {
    if (node.constructor.name === "IfcPropertySet") {
      const obj = {
        name: `Entity: ${node.constructor.name}.    Name: ${node.Name?.value || "Unnamed"}`,
        singleValues: []
      };
      for (const i of node.HasProperties) {
        const set = await model.getProperties(i.value);
        obj.singleValues.push(set);
      }
      return obj;
    }
    //  else {
    //   const subnode = await model.getProperties(node.expressID);
    //   console.log("subnode", subnode);
    // }
    return null;
  } catch (error) {}
}

// ===============================================================
// ENTITY ANALYSIS
// ===============================================================

async function analyzeEntity(fragmentID) {
  console.log("attributes", attributesRef.value);
  const model = lastModel.value;
  const indexer = components.value.get(OBC.IfcRelationsIndexer);
  const relations = [
    "IsDecomposedBy",
    "Decomposes",
    "AssociatedTo",
    "HasAssociations",
    "ClassificationForObjects",
    "IsGroupedBy",
    "HasAssignments",
    "IsDefinedBy",
    "DefinesOcurrence",
    "IsTypedBy",
    "Types",
    "Defines",
    "ContainedInStructure",
    "ContainsElements",
    "HasControlElements",
    "AssignedToFlowElement",
    "ConnectedTo",
    "ConnectedFrom",
    "ReferencedBy",
    "Declares",
    "HasContext",
    "Controls",
    "IsNestedBy",
    "Nests",
    "DocumentRefForObjects"
  ];
  const UiValues = [];
  const hasRelations = [];
  relations.forEach((relationType) => {
    const relations = indexer.getEntityRelations(
      model,
      fragmentID,
      relationType
    );
    if (relations.length) {
      hasRelations.push(relationType);
    }
  });
  const entityProperties = new Set();
  const ifcPropertySets = [];
  const meshes = [];

  for (const relationType of hasRelations) {
    const relations = indexer.getEntityRelations(
      model,
      fragmentID,
      relationType
    );
    for (const relationId of relations) {
      const properties = await model.getProperties(relationId);
      meshes.push(properties);
      // entityProperties.add({ relationType, relationId, properties });
    }
  }
  for (const meshe of meshes) {
    const tre = await prepareData(model, indexer, meshe);
    if (tre) UiValues.push(tre);
    console.log("tree", tre);
  }
  console.log(UiValues);
  propsListsRef.value = UiValues;
  propertySets.value = ifcPropertySets;
  console.log("Property sets:", propertySets.value);
}

// ===============================================================
// INITIALIZATION
// ===============================================================

onMounted(async () => {
  // Initialize BIM UI library
  BUI.Manager.init();

  // Set up components
  const componentsInstance = new OBC.Components();

  // Set up 3D scene
  const worlds = componentsInstance.get(OBC.Worlds);
  const worldInstance = worlds.create();

  // Configure scene components
  const sceneComponent = new OBC.SimpleScene(componentsInstance);
  sceneComponent.setup();
  worldInstance.scene = sceneComponent;

  const rendererComponent = new OBC.SimpleRenderer(
    componentsInstance,
    container.value
  );
  worldInstance.renderer = rendererComponent;

  const cameraComponent = new OBC.SimpleCamera(componentsInstance);
  worldInstance.camera = cameraComponent;
  worldInstance.camera.controls.setLookAt(10, 5.5, 5, -4, -1, -6.5);

  // Handle window resize
  window.addEventListener("resize", () => {
    rendererComponent.resize();
    cameraComponent.updateAspect();
  });

  // Add grid to scene
  const viewerGrids = componentsInstance.get(OBC.Grids);
  viewerGrids.create(worldInstance);

  // Initialize components
  componentsInstance.init();

  // Set up IFC loader
  const ifcLoader = componentsInstance.get(OBC.IfcLoader);
  await ifcLoader.setup();

  // Set up fragments manager
  const fragmentsManagerInstance = componentsInstance.get(OBC.FragmentsManager);
  fragmentsManagerInstance.onFragmentsLoaded.add((model) => {
    showEntityPanel.value = true;
    if (worldInstance.scene) {
      worldInstance.scene.three.add(model);
    }
    loadedModels.value.push(model);
  });

  // Configure entity attributes table
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
    }
  };

  const [attributesTableInstance, updateAttributesTableFn] =
    BUIC.tables.entityAttributes({
      components: componentsInstance,
      fragmentIdMap: {},
      tableDefinition,
      attributesToInclude: () => {
        const att = [
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
          }
        ];
        attributesRef.value = att;
        return att;
      }
    });

  // Configure table
  attributesTableInstance.expanded = true;
  attributesTableInstance.indentationInText = true;
  attributesTableInstance.preserveStructureOnFilter = preserveStructure.value;

  // Add to DOM
  attributesTableContainer.value.innerHTML = "";
  attributesTableContainer.value.appendChild(attributesTableInstance);

  // Store table references
  attributesTable.value = attributesTableInstance;
  updateAttributesTable.value = updateAttributesTableFn;

  // Setup highlighter
  const highlighterInstance = componentsInstance.get(OBCF.Highlighter);
  highlighterInstance.setup({ world: worldInstance });
  highlighterInstance.zoomToSelection = true;

  // Handle selection events
  highlighterInstance.events.select.onHighlight.add((fragmentIdMap) => {
    propertySets.value = [];
    for (const meshId in fragmentIdMap) {
      analyzeEntity([...fragmentIdMap[meshId]][0]);
    }
    updateAttributesTableFn({ fragmentIdMap });
  });

  highlighterInstance.events.select.onClear.add(() => {
    propertySets.value = [];
    updateAttributesTableFn({ fragmentIdMap: {} });
  });

  // Store references
  components.value = componentsInstance;
  fragmentsManager.value = fragmentsManagerInstance;
  world.value = worldInstance;
  highlighter.value = highlighterInstance;
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
