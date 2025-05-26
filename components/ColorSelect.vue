<script lang="ts" setup>
const { topColor, bottomColor, setTopColor, setBottomColor } = useColor();
</script>

<template>
  <div class="flex flex-col gap-4">
    <ColorField
      :color="topColor"
      :title="'Top Color'"
      @update:color="setTopColor"
    />
    <ColorField
      :color="bottomColor"
      :title="'Bottom Color'"
      @update:color="setBottomColor"
    />
  </div>
</template>
