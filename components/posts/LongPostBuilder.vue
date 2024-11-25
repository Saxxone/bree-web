<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
import { HTMLInputType } from "~/types/types";

interface DefaultPost {
  text: string;
  media: string[];
  files: File[];
}

const { t } = useI18n();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const default_post: DefaultPost = {
  text: "",
  media: [],
  files: [],
};

//long post cannot be a comment

const contents = ref([{ ...default_post }]);

const current_page = ref(0);

function addPage() {
  if (contents.value.length <= 7) {
    contents.value.push({ ...default_post });

    nextTick(() => goToPage(contents.value.length - 1));
  } else {
    addSnack({
      type: "info",
      message: t("posts.cannot_add_more_than_8"),
      timeout: 1000,
      statusCode: 400,
    });
  }
}

function goToPage(index: number) {
  current_page.value = index;
}
</script>

<template>
  <div>
    <div class="flex">
      <button class="btn-primary-outline ml-auto btn-sm block" @click="addPage">
        {{ t("posts.add_page") }}
      </button>
    </div>
    <div class="ml-auto flex justify-end mb-3">
      <div
        class="text-main bg-base-white flex ml-auto h-8 w-8 items-center justify-center mt-3 rounded-full"
      >
        {{ current_page + 1 }}
      </div>
    </div>
    <div class="flex overflow-x-auto snap-x space-x-4" ref="scroller">
      <AppSnapScroller
        :contents="contents"
        @page="(page) => (current_page = page)"
        :current-page="current_page"
        class="w-full"
      >
        <div
          class="text-main grid grid-cols-1 justify-items-stretch items-center text-center h-56 border-gray-600 mb-4 rounded-lg border"
        >
          <PostsAddMedia
            v-model:media="contents[current_page].files"
            :max-files="1"
            :multiple="false"
            :icon="false"
            class="w-full h-full flex items-center justify-center"
          >
            <p v-if="!contents[current_page].files.length" class="text-center">
              {{ t("posts.add_media") }}
            </p>
            <PostsFilePreview
              :file-list="contents[current_page].files"
              :removable="false"
              v-else
              class="w-full h-full flex items-center justify-center"
            />
          </PostsAddMedia>
        </div>
        <FormsFormInput
          v-model="contents[current_page].text"
          name="post"
          :input-type="HTMLInputType.Textarea"
          class="!p-0 !border-0"
          :rows="5"
          focus
          :placeholder="t('posts.placeholder')"
        />
      </AppSnapScroller>
    </div>
  </div>
</template>
