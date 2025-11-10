<!-- SigData Decoder Demo Component -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { NCard, NButton, NInput, NSpace, NCode, useMessage } from 'naive-ui';
import { decodeSigData, encodeSigData, type DecodedSigData } from '@/utils/sig-data';
import { SRS } from '@/modules/drawing-tool/models';
import { WKT } from '@/modules/drawing-tool/utils/wkt';
import { projectGeometry } from '@/modules/drawing-tool/utils/projection';

const msg = useMessage();

// Example SigData from your example.json
const exampleSigData = ref("VTFKVE9qSTJNVGswSUMwZ1YwdFVPbEJQVEZsSFQwNG9LRFF6TURVMU9TNDRPVGczTmpZME5qSXpOQ0ExTXpRM01qZ3VNREl5TWpnMk5EYzBNaXcwTXpBNE9UTXVPVGM0TnpZMU9ESTFPRFlnTlRNME1qTXlMalE0TWpJNE56SXhOamdzTkRNeE5EZzRMalV6T0RjMk5UZ3dPVGcxSURVek5EWXpOeTR3TVRJeU9EY3pOell4TERRek1URXhPUzQwTWpnM05qWTBOekEwSURVek5URXpOUzR3TlRJeU9EWTFPVlVzTkRNd05UVTVMamc1T0RjMk5qUTJNak0wSURVek5EY3lPQzR3TWpJeU9EWTBOelF5S1NrPQ==");
const customSigData = ref("");
const customWkt = ref("POLYGON((430559.89876646234 534728.0222864742,430893.97876582586 534232.4822872168,431488.53876580985 534637.0122873761,431119.4287664704 535135.052286595,430559.89876646234 534728.0222864742))");
const customSrs = ref<SRS>(SRS.MLZ3);

// Decode the example SigData
const decodedExample = computed(() => {
  if (!exampleSigData.value) return null;
  return decodeSigData(exampleSigData.value);
});

// Decode custom SigData
const decodedCustom = computed(() => {
  if (!customSigData.value) return null;
  return decodeSigData(customSigData.value);
});

// Generate new SigData from custom WKT
const generateSigData = () => {
  if (!customWkt.value) {
    msg.warning("Please enter a WKT string");
    return;
  }
  
  try {
    const encoded = encodeSigData(customWkt.value, customSrs.value);
    customSigData.value = encoded;
    msg.success("SigData generated successfully!");
  } catch (error) {
    msg.error("Failed to generate SigData: " + error.message);
  }
};

// Project geometry to WGS84 for visualization
const getProjectedGeometry = (decoded: DecodedSigData | null) => {
  if (!decoded?.geometry) return null;
  
  try {
    return projectGeometry(decoded.geometry, decoded.srs, SRS.WGS84);
  } catch (error) {
    console.warn("Failed to project geometry:", error);
    return decoded.geometry;
  }
};

// Get coordinate bounds for display
const getCoordinateBounds = (decoded: DecodedSigData | null) => {
  const projected = getProjectedGeometry(decoded);
  if (!projected) return null;
  
  if (projected.type === 'Polygon') {
    const coords = projected.coordinates[0];
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    
    return {
      minLng: Math.min(...lngs).toFixed(6),
      maxLng: Math.max(...lngs).toFixed(6),
      minLat: Math.min(...lats).toFixed(6),
      maxLat: Math.max(...lats).toFixed(6),
    };
  }
  
  return null;
};

const clearCustom = () => {
  customSigData.value = "";
  customWkt.value = "";
};

const loadExample = () => {
  if (decodedExample.value) {
    customWkt.value = decodedExample.value.wkt;
    customSrs.value = decodedExample.value.srs;
  }
};
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">SigData Decoder Demo</h1>
    
    <!-- Example SigData Section -->
    <NCard title="Example SigData from API" size="small">
      <NSpace vertical size="medium">
        <div>
          <h4 class="text-sm font-semibold mb-2">Raw SigData (Base64):</h4>
          <NCode :code="exampleSigData" language="text" class="text-xs" style="max-height: 80px; overflow-y: auto;" />
        </div>
        
        <div v-if="decodedExample">
          <h4 class="text-sm font-semibold mb-2">Decoded Information:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><strong>SRS:</strong> {{ decodedExample.srs }} (EPSG:{{ decodedExample.epsgCode }})</div>
            <div><strong>Geometry Type:</strong> {{ decodedExample.geometry?.type }}</div>
            <div class="col-span-2">
              <strong>WKT:</strong>
              <NCode :code="decodedExample.wkt" language="text" class="text-xs mt-1" />
            </div>
            <div v-if="getCoordinateBounds(decodedExample)" class="col-span-2">
              <strong>Bounds (WGS84):</strong>
              <div class="text-xs mt-1 grid grid-cols-2 gap-2">
                <div>Lng: {{ getCoordinateBounds(decodedExample)?.minLng }} to {{ getCoordinateBounds(decodedExample)?.maxLng }}</div>
                <div>Lat: {{ getCoordinateBounds(decodedExample)?.minLat }} to {{ getCoordinateBounds(decodedExample)?.maxLat }}</div>
              </div>
            </div>
          </div>
        </div>
      </NSpace>
    </NCard>

    <!-- Custom SigData Generator -->
    <NCard title="Generate Custom SigData" size="small">
      <NSpace vertical size="medium">
        <div>
          <h4 class="text-sm font-semibold mb-2">Input WKT Geometry:</h4>
          <NInput
            v-model:value="customWkt"
            type="textarea"
            placeholder="Enter WKT string (e.g., POLYGON((x1 y1, x2 y2, ...)))"
            :rows="3"
          />
        </div>
        
        <div>
          <h4 class="text-sm font-semibold mb-2">Select SRS:</h4>
          <select v-model="customSrs" class="px-3 py-2 border rounded">
            <option :value="SRS.WGS84">WGS84 (EPSG:4326)</option>
            <option :value="SRS.MLZ1">MLZ1 (EPSG:26191)</option>
            <option :value="SRS.MLZ2">MLZ2 (EPSG:26192)</option>
            <option :value="SRS.MLZ3">MLZ3 (EPSG:26194)</option>
            <option :value="SRS.MLZ4">MLZ4 (EPSG:26195)</option>
            <option :value="SRS.Mercator">Mercator (EPSG:3785)</option>
          </select>
        </div>
        
        <NSpace>
          <NButton type="primary" @click="generateSigData">Generate SigData</NButton>
          <NButton @click="loadExample">Load Example</NButton>
          <NButton @click="clearCustom">Clear</NButton>
        </NSpace>
        
        <div v-if="customSigData">
          <h4 class="text-sm font-semibold mb-2">Generated SigData:</h4>
          <NCode :code="customSigData" language="text" class="text-xs" style="max-height: 80px; overflow-y: auto;" />
        </div>
        
        <div v-if="decodedCustom">
          <h4 class="text-sm font-semibold mb-2">Verification (Decoded):</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><strong>SRS:</strong> {{ decodedCustom.srs }} (EPSG:{{ decodedCustom.epsgCode }})</div>
            <div><strong>Geometry Type:</strong> {{ decodedCustom.geometry?.type }}</div>
            <div v-if="getCoordinateBounds(decodedCustom)" class="col-span-2">
              <strong>Bounds (WGS84):</strong>
              <div class="text-xs mt-1 grid grid-cols-2 gap-2">
                <div>Lng: {{ getCoordinateBounds(decodedCustom)?.minLng }} to {{ getCoordinateBounds(decodedCustom)?.maxLng }}</div>
                <div>Lat: {{ getCoordinateBounds(decodedCustom)?.minLat }} to {{ getCoordinateBounds(decodedCustom)?.maxLat }}</div>
              </div>
            </div>
          </div>
        </div>
      </NSpace>
    </NCard>

    <!-- Usage Instructions -->
    <NCard title="Usage in Your Code" size="small">
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-semibold mb-2">Import the utility:</h4>
          <NCode code="import { decodeSigData, encodeSigData } from '@/utils/sig-data';" language="typescript" />
        </div>
        
        <div>
          <h4 class="text-sm font-semibold mb-2">Decode SigData:</h4>
          <NCode 
            code="const decoded = decodeSigData(sigDataString);
if (decoded) {
  console.log('SRS:', decoded.srs);
  console.log('WKT:', decoded.wkt);
  console.log('Geometry:', decoded.geometry);
}"
            language="typescript" 
          />
        </div>
        
        <div>
          <h4 class="text-sm font-semibold mb-2">Use with existing map utilities:</h4>
          <NCode 
            code="import { projectGeometry } from '@/modules/drawing-tool/utils/projection';
import { SRS } from '@/modules/drawing-tool/models';

// Project to WGS84 for map display
const wgs84Geometry = projectGeometry(decoded.geometry, decoded.srs, SRS.WGS84);

// Use with existing map components
// <MapboxLayer :wkt='decoded.wkt' :srs='decoded.srs' :map='map' />"
            language="typescript" 
          />
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.n-code {
  font-size: 11px !important;
}
</style>
