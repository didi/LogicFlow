<template>
  <div class="w-full h-full px-4 py-2 leading-6 bg-[#eee]">
    <p class="line-clamp-1 break-all">
      {{ properties.url }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  properties: any
}

defineProps<IProps>()
</script>
