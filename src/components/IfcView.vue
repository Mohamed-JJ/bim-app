<template>
  <div class="w-screen h-screen">
    <div id="container" ref="container" class="relative w-full h-full">
      <!-- BIM Panel for IFC Models -->
      <div class="absolute top-0 left-0 text-black bg-white rounded-md">
        <n-collapse arrow-placement="right" class="p-3">
          <n-collapse-item title="control panel">
            <n-collapse arrow-placement="right" class="p-3">
              <n-collapse-item title="load IFC Models" name="1">
                <div>
                  <NButton
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
                  </NButton>
                </div>
              </n-collapse-item>
              <n-collapse-item title="load Sample Model" name="2">
                <div>
                  <NButton
                    text-color="white"
                    color="#2e3338"
                    @click="loadSampleModel"
                  >
                    Load Sample Model
                  </NButton>
                </div>
              </n-collapse-item>
              <n-collapse-item title="models list" name="3">
                <div class="text-black w-full border-2 border-white">
                  <div v-if="loadedModelsList.length === 0">
                    <p>no loaded models yet</p>
                  </div>
                  <div
                    v-else
                    v-for="(model, key) in loadedModelsList"
                    :key="key"
                    class="text-black flex gap-3 items-center py-2 px-3 rounded-md hover:bg-gray-200 duration-200"
                  >
                    {{ model.uuid }}
                    <button
                      class="flex items-center justify-center rounded-md hover:cursor-pointer hover:scale-125 duration-200"
                      @click="() => handleVisibilityClick(model as FragmentsGroup)"
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
                      @click="() => disposeFragementGroup(model as FragmentsGroup, key)"
                    >
                      <n-icon size="20">
                        <div class="">
                          <TrashBin />
                        </div>
                      </n-icon>
                    </button>
                  </div>
                </div>
              </n-collapse-item>
              <n-collapse-item title="export gltf" name="4">
                <div>
                  <NButton
                    @click="exportGLTF"
                    text-color="white"
                    color="#2e3338"
                  >
                    Export GLTF
                  </NButton>
                </div>
              </n-collapse-item>
              <n-collapse-item title="dispose fragments" name="5">
                <div>
                  <NButton
                    @click="disposeFragements"
                    text-color="white"
                    color="#2e3338"
                  >
                    Dispose Fragments
                  </NButton>
                </div>
              </n-collapse-item>
            </n-collapse>
          </n-collapse-item>
        </n-collapse>
        <!-- </div> -->
      </div>

      <!-- Entity Attributes Panel -->
      <div :class="{ hidden: !showEntityPanelRef }">
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
                  @update:value="onSearchInput"
                  type="text"
                  placeholder="Search"
                  size="small"
                >
                </n-input>
                <n-checkbox
                  @update:checked="onPreserveStructureChange"
                  v-model:checked="preserveStructure"
                  ><p class="truncate">Preserve structure</p></n-checkbox
                >
              </div>
              <div class="flex gap-2 items-center">
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
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      @click="onCopyTSV"
                      icon="solar:copy-bold"
                      tooltip-title="Copy TSV"
                      tooltip-text="Copy the table contents as tab separated text values, so you can copy them into a spreadsheet."
                    >
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
                    <n-button
                      @click="onExportJSON"
                      icon="ph:export-fill"
                      tooltip-title="Export JSON"
                      tooltip-text="Download the table contents as a JSON file."
                    >
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
            <div ref="attributesTableContainer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import { useDraggable } from "@vueuse/core";
import { useTemplateRef } from "vue";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import {
  NCard,
  NCollapse,
  NCollapseItem,
  NInput,
  NIcon,
  NCheckbox,
  NSelect,
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
  ChevronForward,
  ChevronDownOutline
} from "@vicons/ionicons5";
import type { EntityAttributesUIState } from "@thatopen/ui-obc/dist/components/tables/EntityAttributes/src/template";
import type { FragmentsGroup } from "@thatopen/fragments";

// Utility functions
const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

const readFile = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer."));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

const handleVisibilityClick = (model: FragmentsGroup) => {
  console.log("Clicked on the visibility button");
  model.visible = !model.visible; // Update the visibility state
};

const triggerFileUpload = () => {
  console.log("here at triiger file upload");
  document.getElementById("ifc-file-input")!.click();
};

// Refs for DOM elements
const container = ref(null);
// const modelsList = ref(null);
const loadedModelsList = ref<FragmentsGroup[]>([]);
const modelsListElementsRef = ref<(BUI.Table<BUI.TableRowData<Record<string, BUI.TableCellValue>>>) | []>([]);
const attributesTableContainer = ref<HTMLElement | null>(null);

// Entity panel state
const preserveStructure = ref(true);

// show the entity panel state
const showEntityPanelRef = ref(false);

// ThatOpen BIM variables and dependencies
const componentsRef = ref<OBC.Components | null>(null);
const worldRef = ref<OBC.SimpleWorld<
  OBC.BaseScene,
  OBC.BaseCamera,
  OBC.BaseRenderer
> | null>(null);
const highlighterRef = ref<OBCF.Highlighter | null>(null);
const last_modelRef = ref<FragmentsGroup | null>(null);
const attributesTableRef = ref<BUI.Table<
  BUI.TableRowData<Record<string, BUI.TableCellValue>>
> | null>(null);
const updateAttributesTableRef =
  ref<BUI.UpdateFunction<EntityAttributesUIState> | null>(null);
const fragementsManagerRef = ref<OBC.FragmentsManager | null>(null);

// Entity attributes panel methods  # will get back to it to give it type
const onSearchInput = (e: any) => {
  if (attributesTableRef.value) {
    attributesTableRef.value.queryString = e;
  }
};

// the old serach handler function
// const onSearchInput = (e) => {
//   if (attributesTableRef.value) {
//     console.log(e)
//     attributesTableRef.value.queryString = e;
//   }
// };

const disposeFragements = () => {
  fragementsManagerRef?.value?.dispose();
  showEntityPanelRef.value = false;
  // loadedModelsList.value = []
};

const onPreserveStructureChange = (e : any) => {
  preserveStructure.value = e;
  if (attributesTableRef.value) {
    attributesTableRef.value.preserveStructureOnFilter =
      preserveStructure.value;
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
    alert(
      "Table data copied as TSV in clipboard! Try to paste it in a spreadsheet app."
    );
  }
};

const onAttributesChange = (e: any) : any => {
  if (updateAttributesTableRef.value) {
    updateAttributesTableRef.value({
      attributesToInclude: () => {
        const attributes = [
          ...e.target.value,
          (name : string) => name.includes("Value"),
          (name : string) => name.startsWith("Material"),
          (name : string) => name.startsWith("Relating"),
          (name : string) => {
            const ignore = ["IsGroupedBy", "IsDecomposedBy"];
            return name.startsWith("Is") && !ignore.includes(name);
          }
        ];
        return attributes;
      }
    });
  }
};

// Handle file upload
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file: File | undefined = target.files?.[0];
  if (!file) {
    alert("No file selected!");
    return;
  }

  try {
    const data: ArrayBuffer = await readFile(file);
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

// Common function to load IFC models
async function loadIFCModel(buffer: Uint8Array, name: string) {
  const ifcLoader = componentsRef?.value!.get(OBC.IfcLoader);
  // @ts-ignore
  const model = await ifcLoader.load(buffer, { name });
  worldRef?.value!.scene.three.add(model);

  // Process entity relations
  await setupEntityAttributes(model);

  last_modelRef.value = model;
}

// Setup entity attributes
async function setupEntityAttributes(model: FragmentsGroup) {
  const indexer = componentsRef?.value!.get(OBC.IfcRelationsIndexer);
  await indexer.process(model);
}

function disposeFragementGroup(group: FragmentsGroup, key: number) {
  fragementsManagerRef?.value!.disposeGroup(group);
  // console.log("deleting at index ", key)
  loadedModelsList.value = loadedModelsList.value.filter(
    (_, index) => index !== key
  );
}

// Export to GLTF
const exportGLTF = () => {
  if (!last_modelRef.value) {
    alert("No model loaded to export!");
    return;
  }

  const exporter = new GLTFExporter();

  exporter.parse(
    worldRef?.value!.scene.three,
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

  const rendererComponent = new OBC.SimpleRenderer(components, container?.value!);
  world.renderer = rendererComponent;

  const cameraComponent = new OBC.SimpleCamera(components);
  world.camera = cameraComponent;
  world.camera.controls?.setLookAt(10, 5.5, 5, -4, -1, -6.5);

  // Handle window resize
  window.addEventListener("resize", () => {
    rendererComponent.resize();
    cameraComponent.updateAspect();
  });

  // Add a grid to the scene
  const viewerGrids = components.get(OBC.Grids);
  viewerGrids.create(world);

  // world.scene.three.background = null; // can chang the color of the background with this lne right here

  // Initialize components
  components.init();

  // Set up the IFC loader
  const ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup();

  // Set up the fragments manager
  const fragmentsManager = components.get(OBC.FragmentsManager);
  fragmentsManager.onFragmentsLoaded.add((model) => {
    showEntityPanelRef.value = true;
    if (world.scene) {
      world.scene.three.add(model);
    }
    const [modelsListElements] = BUIC.tables.modelsList({
      components,
      tags: { schema: true, viewDefinition: false },
      actions: { download: false }
    });
    // console.log("loaded a new element", modelsListElements)
  });

  // Create the models list component
  const [modelsListElement] = BUIC.tables.modelsList({
    components,
    tags: { schema: true, viewDefinition: false },
    actions: { download: false }
  });

  // Append the models list to the DOM
  // console.log(modelsList)
  modelsListElementsRef.value = modelsListElement;
  // modelsList.value.appendChild(modelsListElement); // removed because the functionality i added was good enough, might revert back to it in the future

  // Configure entity attributes panel
  const baseStyle = { padding: "0.25rem", borderRadius: "0.25rem" };
  const tableDefinition = {
    Entity: (entity: any) => {
      let style = {};
      if (entity === OBC.IfcCategoryMap[WEBIFC.IFCPROPERTYSET]) {
        style = { ...baseStyle, backgroundColor: "purple", color: "white" };
      }
      if (String(entity).includes("IFCWALL")) {
        style = { ...baseStyle, backgroundColor: "green", color: "white" };
      }
      return BUI.html`<bim-label style=${BUI.styleMap(style)}>${entity}</bim-label>`;
    },
    PredefinedType: (type : any) => {
      const colors = ["#1c8d83", "#3c1c8d", "#386c19", "#837c24"];
      const randomIndex = Math.floor(Math.random() * colors.length);
      const backgroundColor = colors[randomIndex];
      const style = { ...baseStyle, backgroundColor, color: "white" };
      return BUI.html`<bim-label style=${BUI.styleMap(style)}>${type}</bim-label>`;
    },
    NominalValue: (value : any) => {
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

  const [attributesTable, updateAttributesTable] = BUIC.tables.entityAttributes(
    {
      components,
      fragmentIdMap: {},
      tableDefinition,
      attributesToInclude: () => {
        const attributes = [
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
          }
        ];
        return attributes;
      }
    }
  );

  // Configure table
  attributesTable.expanded = true;
  attributesTable.indentationInText = true;
  attributesTable.preserveStructureOnFilter = preserveStructure.value;

  fragmentsManager.onFragmentsLoaded.add((model) => {
    loadedModelsList.value.push(model);
  });
  // Add to the DOM
  if (attributesTableContainer.value) {
    attributesTableContainer.value.innerHTML = '';
  }
  attributesTableContainer?.value!.appendChild(attributesTable)!;

  // Store reference to the table
  attributesTableRef.value = attributesTable;
  updateAttributesTableRef.value = updateAttributesTable;

  // Setup highlighter
  const highlighter = components.get(OBCF.Highlighter);
  highlighter.setup({ world });
  highlighter.zoomToSelection = true; // to zoom the the selected part of the model

  async function logStuff(fragmentID: number) {
    console.log(typeof fragmentID)
    var model = last_modelRef.value;
    // console.log("[LOGSTUFF] model ", model);

    if (!model) return;
    const _indexer = componentsRef?.value!.get(OBC.IfcRelationsIndexer);
    await _indexer.process(model as FragmentsGroup);

    const psets = _indexer.getEntityRelations(model as FragmentsGroup, fragmentID, "IsDefinedBy");
    const types = _indexer.getEntityRelations(model as FragmentsGroup, fragmentID, "IsTypedBy");
    const contructs = _indexer.getEntityRelations(
      model as FragmentsGroup,
      fragmentID,
      "ContainedInStructure" // it is in the IFC models and i will integrate it in the code after i made something to integrate it in the code and the ui
    );

    // console.log("[INDEXER] psets : ", psets);
    if (psets) {
      const psetSet = [];
      for (const expressID of psets) {
        // You can get the pset attributes like this
        const pset = await model.getProperties(expressID);
        // You can get the pset props like this or iterate over pset.HasProperties yourself
        await OBC.IfcPropertiesUtils.getPsetProps(
          model as FragmentsGroup,
          expressID,
          async (propExpressID) => {
            const prop = await (model as FragmentsGroup).getProperties(propExpressID);
            psetSet.push(prop);
            if (prop != null) {
            } else {
              // console.log("[INDEXER] prop null", propExpressID);
            }
          }
        );
      }
      // console.table("the property sets are", psetSet.map(item => item.Name.value))
    }

    if (types) {
      const pset = [];
      for (const expressID of types) {
        const pse = await model?.getProperties(expressID);
        // console.log(pse);
        if (pse) {
        for (const IdEx of pse.HasPropertySets) {
          const pet = await model.getProperties(IdEx.value);
          await OBC.IfcPropertiesUtils.getPsetProps(
            model as FragmentsGroup,
            pet!.expressID,
            async (propExpressID) => {
              const prop = await model?.getProperties(propExpressID);
              if (prop != null) {
                console.log("the prop is: ", prop);
              } else {
                console.log("[INDEXER] prop null", propExpressID);
              }
            }
          );
        }
      }
      }
      // to store the values only once and have them repeated
      // const typeSet = new Set();
      // for (const expressID of types) {
      //   // You can get the pset attributes like this
      //   const pset = await model.getProperties(expressID);
      //   if (!pset) continue;
      //   const stuff = await _indexer.getEntityChildren(model, expressID);
      //   for (const s of stuff) {
      //     const p = await model.getProperties(s);
      //     const stuffChild = await _indexer.getEntityChildren(model, s);
      //     // console.log("the ret from get entity children", stuffChild)
      //     // [...stuffChild].map()
      //     for (const somet of stuffChild) {
      //       const ch = await _indexer.getEntityChildren(model, somet);
      //       const h = await model.getProperties(ch);
      //       console.log(h)
      //       const ret = await OBC.IfcPropertiesUtils.getPsetProps(
      //         model,
      //         somet
      //       );
      //       console.log(ret)
      //       // const w = await model.(somet);
      //       // console.log("inner loop for printing", w);
      //     }
      //     typeSet.add(p);
      //   }
      // }
      // console.log("the types are", typeSet);
    }
    if (contructs) {
      const consSet = new Set();
      for (const expressID of contructs) {
        // You can get the pset attributes like this
        if (model) {
          const pset = await model.getProperties(expressID);
          if (!pset) continue;
          // need to get back to this
          const stuff = await _indexer.getEntityChildren(model as FragmentsGroup, expressID);
          for (const s of stuff) {
            const p = await model.getProperties(s);
            consSet.add(p);
          }
        }
      }
      // console.log("the consSet is", consSet)
    }
  }

  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    // const objectKeys = Object.keys(fragmentIdMap);
    // console.log("the highlighter consoles this :", objectKeys, fragmentIdMap);
    console.log("[ONHIGHLIGHT] data ", fragmentIdMap);
    for (var meshId in fragmentIdMap) {
      // console.log("[HIGHLIGHTER] Event triggered");
      // console.log("[HIGHLIGHTER] MeshId : ", meshId);
      // console.log("[HIGHLIGHTER] FragmentId : ", [...fragmentIdMap[meshId]][0]);

      logStuff([...fragmentIdMap[meshId]][0]);
    }
    updateAttributesTable({ fragmentIdMap });
  });

  highlighter.events.select.onClear.add(() =>
    updateAttributesTable({ fragmentIdMap: {} })
  );

  // Store references
  componentsRef.value = components;
  fragementsManagerRef.value = fragmentsManager;
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
