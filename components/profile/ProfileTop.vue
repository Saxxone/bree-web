<script lang="ts" setup>
import type { User } from "~/types/user";
import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

interface Props {
  user: User;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { t } = useI18n();

const img = useImage();
const isSameUser = computed(() => user.value?.id === props.user?.id);
const isFollowing = computed(() => true);

async function editImg() {
  if (!isSameUser.value) return;
}
async function editBanner() {
  if (!isSameUser.value) return;
}
async function editBio() {
  if (!isSameUser.value) return;
}
</script>

<template>
  <div>
    <div
      @click.prevent.stop="editBanner"
      class="h-52 -mx-4 -mt-20 overflow-hidden bg-cover bg-base-dark"
      :style="{
        backgroundImage: `url(${props.user?.banner})`,
      }"
    ></div>
    <div class="flex items-center justify-between py-3">
      <NuxtImg
        width="100"
        height="100"
        class="avatar -mt-16 border-purple-900 border-2"
        :src="props.user?.img"
        :alt="props.user.name"
        :placeholder="
          img(props.user?.img as string, {
            h: 70,
            w: 70,
            f: 'png',
            blur: 2,
            q: 50,
          })
        "
      />

      <NuxtLink
        :to="app_routes.profile.edit"
        v-if="isSameUser"
        class="bg-purple-700 text-white py-2 px-6 rounded-3xl font-medium capitalize"
        >{{ t("profile.edit") }}</NuxtLink
      >
      <button
        v-else
        class="bg-purple-700 text-white py-2 px-6 rounded-3xl font-medium capitalize"
      >
        {{ t("profile.follow") }}
      </button>
    </div>

    <div>
      <div class="flex items-center mb-1">
        <h1 class="text-2xl font-medium text-main mb-0 leading-none">
          {{ props.user.name }}
        </h1>
        <span
          v-if="props.user.verified"
          class="material-symbols-rounded filled text-2xl ml-2 text-purple-700"
        >
          verified
        </span>
      </div>
      <div class="text-sm text-sub">{{ props.user.username }}</div>
    </div>

    <p class="text-sm text-sub py-4" v-if="props.user.bio">
      {{ props.user.bio }}
    </p>
  </div>
</template>
