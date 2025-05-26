<script lang="ts" setup>
useServerHead({
  title: "Human Title Tool",
  link: [],
});

const { topColor, bottomColor } = useColor();
const { text } = useText();

// Canvas Height
const header = ref<HTMLElement | null>(null);
const canvasHeight = ref(0);

const onResize = () => {
  if (header.value) {
    const headerHeight = header.value.offsetHeight;
    canvasHeight.value = window.innerHeight - headerHeight;
  }
};
onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize ", onResize);
});
</script>

<template>
  <Html class="h-full bg-background text-primary">
    <Body class="h-full">
      <NuxtRouteAnnouncer />

      <div
        ref="header"
        class="bg-[#f5f5f5] border-b flex items-center justify-center p-4 w-full overflow-hidden"
      >
        <div class="flex gap-12">
          <TextArea />
          <ColorSelect />
          <Export />
        </div>
      </div>

      <div
        class="flex items-center justify-center w-full relative p-4 transition-colors"
        :style="{
          height: canvasHeight + 'px',
        }"
        :class="{
          'bg-gray-300': canvasHeight > 0,
          'bg-white': canvasHeight === 0,
        }"
      >
        <TextCanvas v-if="canvasHeight" />
        <div v-else class="text-gray-500">Loading canvas...</div>
      </div>
    </Body>
  </Html>
</template>

<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
