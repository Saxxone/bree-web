<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import type { Author } from "~/types/user";
import app_routes from "~/utils/routes";

interface Props {
  author: Author;
  comment: boolean;
  monetizationEnabled?: boolean;
  pricedCostMinor?: number | null;
  sourceStreamQuality?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  monetizationEnabled: false,
});

const { t } = useI18n();

const showMonetizationMeta = computed(
  () =>
    !!props.sourceStreamQuality ||
    props.pricedCostMinor != null ||
    (props.monetizationEnabled && props.pricedCostMinor == null),
);
</script>

<template>
  <div class="flex items-start justify-between gap-2">
    <div class="min-w-0 flex-1">
      <Icon
        v-if="props.comment"
        class="text-muted mb-1 block"
        icon="ic:round-reply"
      />
      <div class="inline-flex items-center">
        <NuxtLink
          :to="
            app_routes.profile.view(encodeURIComponent(props.author.username))
          "
          class="flex items-center"
        >
          <AppUserAvatar
            :src="props.author?.img"
            :alt="props.author.name"
            :width="40"
            :height="40"
            img-class="avatar"
          />

          <NuxtLink
            :to="
              app_routes.profile.view(encodeURIComponent(props.author.username))
            "
            class="text-main max-w-50 ml-2 inline-block h-12 overflow-hidden text-ellipsis font-medium hover:underline"
          >
            <div>{{ props.author?.name }}</div>
            <div class="text-muted text-sm">@{{ props.author?.username }}</div>
          </NuxtLink>
        </NuxtLink>

        <Icon
          v-if="props.author.verified"
          icon="ic:twotone-verified"
          class="ml-2 text-violet-700"
        />
      </div>
    </div>

    <div
      v-if="props.monetizationEnabled || showMonetizationMeta"
      class="text-muted shrink-0 text-right text-xs leading-tight"
    >
      <div v-if="showMonetizationMeta" class="max-w-[11rem] space-y-0.5">
        <div v-if="props.sourceStreamQuality">
          {{ props.sourceStreamQuality }}
        </div>
        <div
          v-if="props.pricedCostMinor != null && props.monetizationEnabled"
          class="flex items-center justify-end gap-1"
          :title="t('posts.monetization_coin_aria')"
        >
          <span class="tabular-nums">{{ props.pricedCostMinor }}</span>
          <IconsLineCoins :size="18" class="shrink-0" aria-hidden="true" />
          <span class="sr-only">{{ t("posts.monetization_coin_aria") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
