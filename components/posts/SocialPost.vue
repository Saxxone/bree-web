<script setup lang="ts">
import type { Post } from "~/types/post";
import type { Author } from "~/types/user";
import app_routes from "~/utils/routes";

function quotedPreviewText(q: Post): string | undefined {
  if (q.text) return q.text as string;
  const first = q.longPost?.content?.[0]?.text;
  return typeof first === "string" ? first : undefined;
}

interface Props {
  post: Post;
  actions?: boolean;
  truncate?: boolean;
  isFetching?: boolean;
  /** When true, tapping a paid video in the card opens a coin / availability interstitial first. */
  paidVideoClickInterstitial?: boolean;
  showVideoMuteToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: true,
  truncate: false,
  paidVideoClickInterstitial: true,
  showVideoMuteToggle: true,
});

const quotedText = computed(() =>
  props.post.quotedPost ? quotedPreviewText(props.post.quotedPost) : undefined,
);
</script>

<template>
  <div>
    <SkeletonsPostSkeleton v-if="isFetching" />

    <NuxtLink
      v-else
      class="bg-base-white mb-2 block cursor-pointer rounded-lg p-3"
      :to="app_routes.post.view(props.post.id)"
    >
      <PostsSocialPostTop
        :author="props.post.author as Author"
        :comment="props.post.parentId ? true : false"
        :monetization-enabled="props.post.monetizationEnabled === true"
        :priced-cost-minor="props.post.pricedCostMinor"
        :source-stream-quality="props.post.sourceStreamQuality"
      />

      <div
        v-if="
          props.post.type === 'LONG' && props.post.longPost?.content?.length
        "
        class="flex snap-x space-x-4 overflow-x-auto"
      >
        <div
          v-for="(long_post, index) in props.post.longPost.content"
          :key="index + '-long-post' + props.post.longPost.id"
          class="w-full shrink-0 snap-start"
        >
          <PostsSocialDisplayPostMedia
            :media="long_post.media as string[]"
            :media-playback="long_post.mediaPlayback"
            :media-metadata="long_post.mediaMetadata"
            :media-types="long_post.mediaTypes"
            :post-id="props.post.id"
            :monetization-enabled="props.post.monetizationEnabled === true"
            :priced-cost-minor="props.post.pricedCostMinor"
            :paid-video-click-interstitial="props.paidVideoClickInterstitial"
            :show-video-mute-toggle="props.showVideoMuteToggle"
          />
          <PostsSocialPostText
            :id="post.id"
            :show-all="props.truncate"
            :text="long_post.text as string"
          />
        </div>
      </div>

      <div v-else>
        <div v-if="(props.post.media?.length ?? 0) > 0">
          <PostsSocialDisplayPostMedia
            :media="props.post.media as string[]"
            :media-playback="props.post.mediaPlayback"
            :media-metadata="props.post.mediaMetadata"
            :media-types="props.post.mediaTypes"
            :post-id="props.post.id"
            :monetization-enabled="props.post.monetizationEnabled === true"
            :priced-cost-minor="props.post.pricedCostMinor"
            :paid-video-click-interstitial="props.paidVideoClickInterstitial"
            :show-video-mute-toggle="props.showVideoMuteToggle"
          />
        </div>

        <PostsSocialPostText
          v-if="props.post.text"
          :id="post.id"
          :show-all="props.truncate"
          :text="props.post.text"
        />
      </div>

      <div
        v-if="props.post.quotedPost?.id"
        class="border-sub mt-2 cursor-pointer rounded-md border border-dashed p-2"
        role="link"
        tabindex="0"
        @click.stop.prevent="
          navigateTo(app_routes.post.view(props.post.quotedPost!.id))
        "
        @keydown.enter.prevent="
          navigateTo(app_routes.post.view(props.post.quotedPost!.id))
        "
        @keydown.space.prevent="
          navigateTo(app_routes.post.view(props.post.quotedPost!.id))
        "
      >
        <PostsSocialPostTop
          :author="props.post.quotedPost.author as Author"
          :comment="false"
          :monetization-enabled="
            props.post.quotedPost.monetizationEnabled === true
          "
          :priced-cost-minor="props.post.quotedPost.pricedCostMinor"
          :source-stream-quality="props.post.quotedPost.sourceStreamQuality"
        />
        <PostsSocialPostText
          v-if="quotedText"
          :id="props.post.quotedPost.id"
          :truncate="true"
          :text="quotedText"
        />
      </div>

      <PostsSocialPostActions v-if="props.actions" :post="post" />
    </NuxtLink>
  </div>
</template>
