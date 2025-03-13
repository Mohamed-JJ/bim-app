<script setup>
import { ref, onMounted } from "vue";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";

// Refs for DOM elements
const container = ref(null);
const modelsList = ref(null);
const loadIfcButton = ref(null);
// const buttonRef = BUIC.buttons.loadIfc({ components });

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
        <bim-panel-section label="Importing" ref="loadIfcButton">
          <!-- {{ loadIfcButton }} -->
        </bim-panel-section>
        <bim-panel-section icon="mage:box-3d-fill" label="Loaded Models">
          <div v-if="modelsList" ref="modelsList">
            <!-- {{ modelsList }} -->
          </div>
          <div v-else ref="modelsList"></div>
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
