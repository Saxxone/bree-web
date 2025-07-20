<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import type { User } from "~/types/user";
import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

interface Props {
  u: User;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { t } = useI18n();

const img = useImage();
const isSameUser = computed(() => user.value.id === props.u.id);

async function editBanner() {
  if (!isSameUser.value) return;
}
</script>

<template>
  <div v-if="props.u">
    <div
      class="bg-base-dark -mx-4 -mt-20 h-52 overflow-hidden bg-cover"
      :style="{
        backgroundImage: `url(${props.u?.banner})`,
      }"
      @click.prevent.stop="editBanner"
    />
    <div class="flex items-center justify-between py-3">
      <NuxtImg
        width="100"
        height="100"
        class="avatar -mt-16 border-2 border-purple-900"
        :src="props.u?.img ?? ''"
        :alt="props.u.name"
        :placeholder="
          img(props.u?.img as string, {
            h: 70,
            w: 70,
            f: 'png',
            blur: 2,
            q: 50,
          })
        "
      />

      <NuxtLink
        v-if="isSameUser"
        :to="app_routes.profile.edit"
        class="rounded-3xl bg-purple-700 px-6 py-2 font-medium capitalize text-white"
        >{{ t("profile.edit") }}</NuxtLink
      >
      <button
        v-else
        class="rounded-3xl bg-purple-700 px-6 py-2 font-medium capitalize text-white"
      >
        {{ t("profile.follow") }}
      </button>
    </div>

    <div>
      <div class="mb-1 flex items-center">
        <h1 class="text-main mb-0 text-2xl font-medium leading-none">
          {{ props.u.name }}
        </h1>
        <Icon
          icon="ic:twotone-verified"
          class="ml-2 mt-1 text-2xl text-purple-700"
        />
      </div>
      <div class="text-sub text-sm">@{{ props.u.username }}</div>
    </div>

    <p v-if="props.u.bio" class="text-sub py-4 text-sm">
      {{ props.u.bio }}
    </p>
  </div>
</template>
