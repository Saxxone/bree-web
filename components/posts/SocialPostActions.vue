<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

type SocialPostAction = {
  icon: string;
  key?: keyof Post & string;
  active: boolean;
  command: () => void | Promise<void>;
};

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const postStore = usePostsStore();
const router = useRouter();
const ff = useFeatureFlags();
const { canComment } = usePostingComposerUi();

const actions = computed((): SocialPostAction[] => {
  const list: SocialPostAction[] = [];

  if (ff.enabled("posting.likes")) {
    list.push({
      icon: "line-md:heart",
      key: "likeCount",
      active: !!props.post?.likedByMe,
      command: likePost,
    });
  }

  if (canComment.value) {
    list.push({
      icon: "ic:round-reply-all",
      key: "commentCount",
      active: false,
      command: comment,
    });
  }

  list.push({
    icon: "ic:twotone-share",
    active: false,
    command: sharePost,
  });

  if (ff.enabled("posting.bookmarks")) {
    list.push({
      icon: "ic:twotone-bookmarks",
      key: "bookmarkCount",
      active: !!props.post?.bookmarkedByMe,
      command: bookmarkPost,
    });
  }

  return list;
});

async function likePost() {
  await postStore.likePost(props.post, !props.post?.likedByMe);
}

async function bookmarkPost() {
  await postStore.bookmarkPost(props.post, !props.post?.bookmarkedByMe);
}

function sharePost() {
  postStore.sharePost(props.post);
}

function comment() {
  router.push({
    path: app_routes.post.compose.post,
    query: { comment: 1, id: props.post.id },
  });
}

const shareIcon = "ic:twotone-share";
</script>

<template>
  <div class="flex items-center pb-2 pt-2">
    <div
      v-for="(item, index) in actions"
      :key="item.icon + post.id + String(index)"
      class="flex cursor-pointer items-center space-x-1"
      :class="[
        item.icon === shareIcon ? 'ms-auto' : 'mr-4',
        {
          'text-violet-500': item.active && item.key !== 'likeCount',
          'text-red-500': item.active && item.key === 'likeCount',
        },
      ]"
      @click.prevent.stop="item.command()"
    >
      <Icon
        :key="item.active ? item.icon + '-active' : item.icon"
        :icon="
          item.active && item.key === 'likeCount'
            ? 'line-md:heart-filled'
            : item.icon
        "
        :class="[
          {
            'text-red-500': item.active && item.key === 'likeCount',
            'text-violet-500': item.active && item.key !== 'likeCount',
            'text-sub': !item.active,
          },
        ]"
      />

      <span v-if="item.key" class="text-sub text-sm font-light">{{
        post[item.key]
      }}</span>
    </div>
  </div>
</template>
