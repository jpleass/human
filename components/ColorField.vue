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

const onInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Validate hex color format (optional)
  if (value.match(/^#([0-9A-F]{3}){1,2}$/i)) {
    emit("update:color", value);
  } else if (value.match(/^([0-9A-F]{3}){1,2}$/i)) {
    // Add # if missing but format is valid
    emit("update:color", `#${value}`);
  }
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
    <input
      type="text"
      :value="color"
      @input="onInputChange"
      class="text-xs border-none outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 w-24"
      placeholder="#RRGGBB"
    />
  </div>
</template>
