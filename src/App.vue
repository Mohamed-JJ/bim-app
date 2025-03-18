<template>
  <!-- Toggle Button -->
  <!-- <button
    @click="toggleView"
    :class="[
      'z-10 absolute top-0 right-1/2 p-2 rounded-md shadow-md transition-colors duration-200',
      isIfcViewerVisible ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700',
    ]"
  >
    {{ isIfcViewerVisible ? "Switch to New Test" : "Switch to IFC Viewer" }}
  </button> -->

  <!-- Conditional Rendering of Components -->
  <!-- <NewTest v-if="!isIfcViewerVisible" /> -->
  <IfcViewer />
</template>

<script setup>
import { ref } from "vue";
import IfcViewer from "./components/IfcViewer.vue";
import NewTest from "./components/NewTest.vue";

// State to manage which component is visible
const isIfcViewerVisible = ref(false);

// Function to toggle between components
const toggleView = () => {
  console.log("Toggling view...");
  isIfcViewerVisible.value = !isIfcViewerVisible.value;
};
</script>

<style scoped>
/* Add global styles for the layout if needed */
button {
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}
</style>