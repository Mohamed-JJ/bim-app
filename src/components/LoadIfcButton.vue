<script>
import { downloadFile, readFile, triggerFileUpload } from "../utils/utils";
</script>

<template>
  <bim-panel-section label="costum Importing">
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
</template>

<style scoped></style>
