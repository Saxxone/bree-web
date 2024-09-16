<script setup lang="ts">
import { HTMLInputType } from "~/types/types";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const default_post = {
  text: "",
  img: "",
};

const postsStore = usePostsStore();
const post = ref<Partial<Post>>({
  ...default_post,
});
const show_create_post = ref(false);

async function createPost(type: "draft" | "publish" = "publish") {
  if (!post.value) {
    return;
  } else if (post.value.text?.trim() === "" && !post.value?.img) {
    return;
  }

  await postsStore.createPost(post.value, type);
  resetPost();
}

function resetPost() {
  show_create_post.value = false;
  post.value = { ...default_post };
}
</script>

<template>
  <div class="fixed bottom-32 z-50 right-3">
    <div
      v-if="!show_create_post"
      class="p-4 flex items-center right-0 justify-center bg-indigo-500 text-white shadow-xl border-violet-400 border rounded-full w-20 h-20"
      @click="show_create_post = true"
    >
      <span class="material-symbols-rounded">edit</span>
    </div>

    <div v-else class="bg-white p-4 shadow-xl w-96 rounded-md h-50">
      <div class="flex items-center justify-between pb-2">
        <div class="font-medium text-gray-600">
          {{ t("posts.create_post") }}
        </div>
        <div class="material-symbols-rounded" @click="show_create_post = false">
          close
        </div>
      </div>

      <div class="mt-4">
        <FormsFormInput
          v-model="post.text"
          name="post"
          :input-type="HTMLInputType.Textarea"
          class="!p-0"
          :rows="5"
          :placeholder="t('posts.placeholder')"
        />
      </div>

      <div class="mt-4 flex space-x-4 justify-end">
        <button
          type="button"
          class="btn-primary-outline text-white !px-8 rounded-md"
          @click="createPost('draft')"
        >
          Save Draft
        </button>
        <button
          type="button"
          class="btn-primary text-white !px-8 rounded-md"
          @click="createPost('publish')"
        >
          Post
        </button>
      </div>
    </div>
  </div>
</template>
