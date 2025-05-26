<script lang="ts" setup>
const { text } = useText();
</script>

<template>
  <textarea
    class="p-2 w-[20em] shrink-0 h-full border bg-white text-black"
    placeholder="Type your text here..."
    v-model="text"
  ></textarea>
</template>
