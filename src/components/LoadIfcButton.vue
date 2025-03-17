<script>
import { downloadFile, readFile, triggerFileUpload } from "../utils/utils";
</script>

<template>
    <NButton text-color="white" color="#2e3338" v-on:click="triggerFileUpload" 
      >Load IFC
      <input
        type="file"
        id="ifc-file-input"
        accept=".ifc"
        style="display: none"
        @change="handleFileUpload"
      />
    </NButton>
    <!-- <bim-button label="Load IFC" @click="triggerFileUpload">
            <input
              type="file"
              id="ifc-file-input"
              accept=".ifc"
              style="display: none"
              @change="handleFileUpload"
            />
          </bim-button>-->
</template>

<style scoped></style>
