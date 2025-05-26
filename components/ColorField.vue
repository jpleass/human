<script lang="ts" setup>
defineProps<{
  color: string;
  title: string;
}>();

const emit = defineEmits<{
  (e: "update:color", value: string): void;
}>();

const onChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit("update:color", input.value);
};
</script>

<template>
  <div
    class="rounded border flex gap-2 items-center p-1 px-2 pt-2 border-gray-300 relative"
  >
    <div
      class="absolute top-0 left-1 text-[0.65em] -translate-y-1/2 bg-[#f5f5f5] px-1 rounded text-gray-500"
      v-html="title"
    ></div>
    <div class="w-[35px] h-[40px] block relative">
      <input
        type="color"
        :value="color"
        @input="onChange"
        class="absolute top-0 left-0 w-full h-full"
      />
    </div>
    <div class="text-xs" v-html="color"></div>
  </div>
</template>
