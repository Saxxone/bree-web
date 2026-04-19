<script setup lang="ts">
import { useGlobalStore } from "~/store/global";
import type { LongPostBlock } from "~/types/post";

interface Props {
  /** File input accept string for slide media (e.g. video-only). */
  mediaAccept?: string;
  /** Empty-state hint in the media drop zone; defaults to posts.add_media. */
  addMediaLabel?: string;
  /** When true, only one slide is allowed; add-page UI is hidden. */
  singlePage?: boolean;
}

const props = defineProps<Props>();

interface DefaultPost {
  text: string;
  media: (string | File)[];
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
  if (props.singlePage) return;
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

  const list = Array.from(files);
  const hasVideo = list.some((f) => f.type.startsWith("video/"));

  if (hasVideo) {
    contents[index].media = [...list];
    return;
  }

  try {
    const uploadedFiles = await useUploadMedia(list);
    contents[index].media = uploadedFiles;
  } catch {
    contents[index].files = [];
  }
}
</script>

<template>
  <div>
    <div v-if="!singlePage" class="mb-3 flex items-center justify-between">
      <div
        class="text-main bg-base-white flex h-8 w-8 items-center justify-center rounded-full"
      >
        {{ current_page + 1 }}
      </div>
      <button class="btn-primary-outline btn-sm ml-auto block" @click="addPage">
        {{ t("posts.add_page") }}
      </button>
    </div>
    <div
      ref="scroller"
      class="flex snap-x space-x-4"
      :class="singlePage ? 'overflow-x-hidden' : 'overflow-x-auto'"
    >
      <div
        v-for="(content, index) in contents"
        :key="index"
        class="w-full shrink-0 snap-start"
      >
        <div
          class="text-main mb-4 grid h-56 grid-cols-1 items-center justify-items-stretch rounded-lg border border-gray-600 text-center"
        >
          <PostsAddMedia
            v-model:media="content.files"
            :max-files="1"
            :multiple="false"
            :icon="false"
            :accept="props.mediaAccept"
            class="flex h-full w-full items-center justify-center"
            @update="handleFileUpload(index, $event)"
          >
            <p v-if="!content.files.length" class="text-center">
              {{ props.addMediaLabel ?? t("posts.add_media") }}
            </p>
            <PostsFilePreview
              v-else
              :file-list="content.files"
              :removable="false"
              class="flex h-full w-full items-center justify-center"
              @deleted="removeFile($event, index)"
            />
          </PostsAddMedia>
        </div>
        <AppRichTextEditor
          v-model="content.text"
          :placeholder="t('posts.placeholder')"
        />
        <div
          v-if="content.text?.length"
          class="text-main my-2 text-right text-xs"
        >
          {{ content.text?.length }} / 300
        </div>
      </div>
    </div>
  </div>
</template>
