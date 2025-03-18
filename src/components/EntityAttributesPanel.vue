<script lang="ts" setup>
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import * as BUI from "@thatopen/ui";
import { onMounted, ref } from "vue";

const attributesTableRef = ref<BUI.Table<
  BUI.TableRowData<Record<string, BUI.TableCellValue>>
> | null>(null);
onMounted(() => {
  // since it follows the singleton design, we can use it here as well
  const components = new OBC.Components();
  console.log(components);
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
  attributesTableRef.value = attributesTable;
});

// return BUI.Component.create<BUI.PanelSection>(() => {
//   return BUI.html`
//       <bim-panel style="position: fixed; max-height: 70vh; top: 20px; left: 5px;">
//         <bim-panel-section label="Entity Attributes" fixed>
//           ${attributesTable}
//         </bim-panel-section>
//       </bim-panel>
//     `;
// });
</script>
<template>
  <bim-panel
    style="position: fixed; max-height: 70vh; top: 20px; left: 5px; z-index: 10"
    v-if="attributesTableRef?.value"
  >
    <bim-panel-section label="Entity Attributes" fixed ref="attributesTableRef">
      <!-- {{ attributesTableRef?.value }} -->
    </bim-panel-section>
  </bim-panel>
</template>
<style></style>
