<script lang="ts" setup>
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
      class="h-52 -mx-4 -mt-20 overflow-hidden bg-cover bg-base-dark"
      :style="{
        backgroundImage: `url(${props.u?.banner})`,
      }"
      @click.prevent.stop="editBanner"
    />
    <div class="flex items-center justify-between py-3">
      <NuxtImg
        width="100"
        height="100"
        class="avatar -mt-16 border-purple-900 border-2"
        :src="props.u?.img"
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
          {{ props.u.name }}
        </h1>
        <span
          v-if="props.u.verified"
          class="material-symbols-rounded filled text-2xl ml-2 text-purple-700"
        >
          verified
        </span>
      </div>
      <div class="text-sm text-sub">{{ props.u.username }}</div>
    </div>

    <p v-if="props.u.bio" class="text-sm text-sub py-4">
      {{ props.u.bio }}
    </p>
  </div>
</template>
