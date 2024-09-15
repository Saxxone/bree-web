<script setup lang="ts">
import { HTMLInputType } from "~/types/types";
import { usePostsStore } from "~/store/posts";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const postsStore = usePostsStore();

const text = ref<string>("");
const show_create_post = ref(false);

async function createPost() {
  if (text.value.trim() === "") {
    return;
  }

  await postsStore.createPost({
    text: text.value,

  });

  show_create_post.value = false;
  text.value = "";
}
</script>

<template>
  <div class="fixed bottom-32 z-50 right-3">
    <div
      v-if="!show_create_post"
      @click="show_create_post = true"
      class="p-4 flex items-center right-0 justify-center bg-white shadow-lg rounded-full w-20 h-20"
    >
      <span class="material-symbols-rounded">edit</span>
    </div>

    <form
      @submit.prevent.stop="createPost"
      v-else
      class="bg-white p-4 shadow-xl w-96 rounded-md h-50"
    >
      <div class="flex items-center justify-between pb-2">
        <div class="font-medium text-gray-600">Create Post</div>
        <div @click="show_create_post = false" class="material-symbols-rounded">
          close
        </div>
      </div>

      <div class="mt-4">
        <FormsFormInput
          name="post"
          :input-type="HTMLInputType.Textarea"
          class="!p-0"
          :rows="5"
          v-model="text"
          placeholder="What's on your mind?"
        />
      </div>

      <div class="mt-4 flex justify-end">
        <button class="btn-primary text-white !px-8 rounded-md">Post</button>
      </div>
    </form>
  </div>
</template>
