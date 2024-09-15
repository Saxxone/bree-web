<script lang="ts" setup>
import type { Post } from "~/types/post";

definePageMeta({
  layout: "social",
  middleware: "auth",
});

const post = ref<Partial<Post>>({
  id: 1,
  date: new Date(),
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus ut libero ultrices ultricies. Nullam nec purus ut libero ultrices ultricies.",
  img: "/images/vr.jpg",
  user: {
    name: "John Doe",
    username: "johndoe",
    img: "/images/profile.jpg",
  },
});

async function getFeed(): Promise<boolean> {
  //validate user auth token
  return false;
}
</script>

<template>
  <div>
    <PostsSocialPost v-for="item in 10" :post="post" :key="item" />
    <PostsCreatePost />
  </div>
</template>
