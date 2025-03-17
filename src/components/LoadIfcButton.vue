<script>
import { downloadFile, readFile, triggerFileUpload } from "../utils/utils";
</script>

<template>
  <NButton text-color="white" color="#2e3338" v-on:click="triggerFileUpload">
    Load IFC
    <input
      type="file"
      id="ifc-file-input"
      accept=".ifc"
      style="display: none"
      @change="handleFileUpload"
    />
  </NButton>
</template>

<style scoped></style>
