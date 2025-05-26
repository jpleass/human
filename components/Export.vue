<script lang="ts" setup>
const { exportSVG, exportPNG, makeTitleFileSafe } = useExport();
const { text } = useText();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>
      <UButton
        @click="() => exportSVG(makeTitleFileSafe(text))"
        icon="i-heroicons-arrow-down-tray"
      >
        Export as SVG
      </UButton>
    </div>
    <div>
      <UButton @click="() => exportPNG()" icon="i-heroicons-arrow-down-tray">
        Export as PNG
      </UButton>
    </div>
  </div>
</template>
