<script lang="ts" setup>
definePageMeta({
  layout: "social",
  middleware: "auth",
});

const post = ref({
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut libero ultrices ultricies. Nullam nec purus ut libero ultrices ultricies.",
  img: "/images/vr.jpg",
  user: {
    name: "John Doe",
    username: "johndoe",
    img: "/images/profile.jpg",
  },
});
</script>

<template>
  <div>
    <PostsSocialPost v-for="item in 10" :post="post" :key="item"/>
  </div>
</template>
