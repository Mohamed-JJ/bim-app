<script setup>
import { ref, onMounted } from "vue";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import {} from "@utils/"

// Refs for DOM elements
const container = ref(null);
const modelsList = ref(null);
const loadIfcButton = ref(null);
const functionRef = ref(null);
const worldRef = ref(null);
const worldsRef = ref(null);
const last_modelRef = ref(null);
// const buttonRef = BUIC.buttons.loadIfc({ components });

const handleClick = () => {
  alert("button clicked");
};

function triggerFileUpload() {
  const fileInput = document.getElementById("ifc-file-input");
  if (fileInput) {
    console.log("clicked on upload element");
    fileInput.click();
  } else {
    console.error("File input element not found");
  }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

async function handleFileUpload(event) {
  console.log("handle upload invoked");
  const file = event?.target?.files[0];
  if (!file) {
    alert("No file selected!");
    return;
  }
  console.log("the ifc file name is :", event.target.files[0].name);
  try {
    console.log("1");
    const data = await readFile(file);
    const buffer = new Uint8Array(data);
    const model = await fragmentIfcLoader.load(buffer);
    world.scene.three.add(model);

    console.log("2");
    await setupEntityAttributes(model);

    metadata = model.getLocalProperties();
    last_model = model;
    console.log("[INIT Load] metadata : ", metadata);
    console.log("[INIT Load] model : ", last_model);
    console.log("3");
  } catch (error) {
    console.error("Error loading IFC file:", error);
    alert("Failed to load IFC file.");
  }
}

const exportGLTF = () => {
  alert("export clicked");
  const exporter = new GLTFExporter();
  //Setup the last model's properties
  var tmpo = [];
  last_modelRef.value.traverse((el) => {
    console.log("smsm", e1);
    tmpo.push(el);
    // var props = fragments.
  });

  console.log("[INIT Load] Traverse ,", tmpo);

  var tmpb = [];
  var tmpc = [];
  last_modelRef.value.items.map((el) => {
    tmpb.push(el);
    tmpc.push(el.exportData());
  });

  console.log("[INIT Load] items ,", tmpb);
  console.log("[INIT Load] extractData,", tmpc);

  exporter.parse(
    worldRef.value.scene.three,
    (gltf) => {
      // Save GLTF
      // gltf["extras"] = metadata;
      if (gltf instanceof ArrayBuffer) {
        const glbBlob = new Blob([gltf], { type: "model/gltf-binary" });
        downloadFile(glbBlob, "model.glb");

        // Save Metadata
      }
      // const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
      // downloadFile(metadataBlob, "metadata.json");
    },
    (err) => {
      console.log("[EXPORT GLTF ERR]  err ", err);
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
    if (world.scene) world.scene.three.add(model);
  });

  const [loadIfcBtn] = BUIC.buttons.loadIfc({ components });

  // Create the models list component
  const [modelsListElement] = BUIC.tables.modelsList({
    components,
    tags: { schema: true, viewDefinition: false },
    actions: { download: false },
  });

  console.log("the model list is, ", modelsListElement);

  // Append the models list to the DOM
  modelsList.value.appendChild(modelsListElement);
  loadIfcButton.value.appendChild(loadIfcBtn);

  worldRef.value = world;
  worldsRef.value = worlds;
});

// Function to load an IFC file
const loadIfc = async () => {
  // Add your IFC loading logic here
  console.log("Loading IFC file...");
};
</script>

<template>
  <div>
    <!-- Container for the 3D viewport -->
    <div id="container" ref="container" class="relative">
      <!-- BIM Panel for IFC Models -->
      <bim-panel
        label="IFC Models"
        class="absolute top-0 left-0 h-full w-[20%]"
      >
        <!-- <bim-panel-section label="Importing" ref="loadIfcButton">
        </bim-panel-section> -->
        <bim-panel-section label="Importing">
          <bim-button label="Load IFC" @click="triggerFileUpload">
            <input
              type="file"
              id="ifc-file-input"
              accept=".ifc"
              style="display: none"
              @change="handleFileUpload"
            />
          </bim-button>
        </bim-panel-section>
        <!-- {{ loadIfcButton }} -->
        <bim-panel-section icon="mage:box-3d-fill" label="Loaded Models">
          <div v-if="modelsList" ref="modelsList">
            <!-- {{ modelsList }} -->
          </div>
          <div v-else ref="modelsList"></div>
        </bim-panel-section>
        <bim-panel-section>
          <bim-button label="Export GLTF" @click="exportGLTF"> </bim-button>
        </bim-panel-section>
      </bim-panel>
    </div>
  </div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
