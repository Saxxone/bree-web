<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
import type { LongPostBlock } from "~/types/post";

interface DefaultPost {
  text: string;
  media: string[];
  files: File[];
}

const data = defineModel<LongPostBlock[]>("data");

const { t } = useI18n();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const default_post: DefaultPost = {
  text: "",
  media: [],
  files: [],
};

const contents = reactive([{ ...default_post }]);
const scroller = ref<HTMLElement | null>(null);
const current_page = ref(0);

function addPage() {
  if (contents.length <= 7) {
    contents.push({ ...default_post });

    nextTick(() => goToPage(contents.length - 1));
  } else {
    addSnack({
      type: "info",
      message: t("posts.cannot_add_more_than_8"),
      timeout: 1000,
    });
  }
}

function goToPage(index: number) {
  nextTick(() => {
    if (
      !scroller.value ||
      !(scroller.value instanceof HTMLElement) ||
      index < 0 ||
      index >= contents.length
    )
      return;

    const child_width = scroller.value?.offsetWidth || 0;
    const scroll_left = index * child_width;
    scroller.value.scrollTo({
      left: scroll_left,
      behavior: "smooth",
    });
    current_page.value = index;
  });
}

function onScroll() {
  if (!scroller.value) return;

  const childWidth = (scroller.value as HTMLElement).offsetWidth || 0;
  const scrollLeft = scroller.value.scrollLeft;
  current_page.value = Math.round(scrollLeft / childWidth);
}

async function processContent() {
  const content: LongPostBlock[] = contents.map((content) => {
    return {
      text: content.text,
      media: content.media,
    } as LongPostBlock;
  });

  data.value = content;
}

watch(
  () => contents,
  () => {
    processContent();
  },
  {
    deep: true,
    immediate: true,
  },
);

onMounted(() => {
  if (scroller.value) {
    scroller.value.addEventListener("scroll", onScroll);
  }
});

onUnmounted(() => {
  if (scroller.value) {
    scroller.value.removeEventListener("scroll", onScroll);
  }
});

function removeFile(f: File[], index: number) {
  contents[index].files = f;
}

async function handleFileUpload(index: number, files: File[] | null) {
  if (!files || files.length === 0 || index < 0 || index >= contents.length)
    return;

  try {
    const uploadedFiles = await useUploadMedia(Array.from(files));
    contents[index].media = uploadedFiles;
  } catch {
    removeFile(files, index);
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <div
        class="text-main bg-base-white flex h-8 w-8 items-center justify-center rounded-full"
      >
        {{ current_page + 1 }}
      </div>
      <button class="btn-primary-outline ml-auto btn-sm block" @click="addPage">
        {{ t("posts.add_page") }}
      </button>
    </div>
    <div ref="scroller" class="flex overflow-x-auto snap-x space-x-4">
      <div
        v-for="(content, index) in contents"
        :key="index"
        class="snap-start shrink-0 w-full"
      >
        <div
          class="text-main grid grid-cols-1 justify-items-stretch items-center text-center h-56 border-gray-600 mb-4 rounded-lg border"
        >
          <PostsAddMedia
            v-model:media="content.files"
            :max-files="1"
            :multiple="false"
            :icon="false"
            class="w-full h-full flex items-center justify-center"
            @update="handleFileUpload(index, $event)"
          >
            <p v-if="!content.files.length" class="text-center">
              {{ t("posts.add_media") }}
            </p>
            <PostsFilePreview
              v-else
              :file-list="content.files"
              @deleted="removeFile($event, index)"
              :removable="false"
              class="w-full h-full flex items-center justify-center"
            />
          </PostsAddMedia>
        </div>
        <AppRichTextEditor
          v-model="content.text"
          :placeholder="t('posts.placeholder')"
        />
        <div
          class="text-main text-right text-xs my-2"
          v-if="content.text?.length"
        >
          {{ content.text?.length }} / 300
        </div>
      </div>
    </div>
  </div>
</template>
