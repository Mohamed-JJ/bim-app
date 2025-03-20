<template>
  <IfcViewer />
</template>

<script setup>
import { ref } from "vue";
import IfcViewer from "./components/IfcViewer.vue";
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
