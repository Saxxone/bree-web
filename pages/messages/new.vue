<script setup lang="ts">
import { Icon } from "@iconify/vue";
import app_routes from "~/utils/routes";
import { HTMLInputType } from "~/types/types";
import { useGlobalStore } from "~/store/global";
import { useUsersStore } from "~/store/users";
import type { User } from "~/types/user";

definePageMeta({
  layout: "room",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title, api_loading } = storeToRefs(globalStore);
const usersStore = useUsersStore();
const { findUser } = usersStore;
const search = ref("");
const take = ref(10);
const skip = ref(0);
const users = ref<Partial<User>[]>();
const show = computed(
  () => !users.value?.length && search.value?.length && !api_loading.value,
);

async function searchUser() {
  users.value = await findUser(
    search.value.toLocaleLowerCase(),
    {
      cursor: users.value?.[0]?.id,
      take: take.value,
      skip: skip.value,
    },
    true,
  );
}

onBeforeMount(() => {
  page_title.value = t("chat.direct_message");
});

watchDebounced(
  () => search.value,
  async () => {
    if (!search.value?.length) {
      // Clear stale results when the input is emptied so the "no results"
      // empty state does not keep showing the previous query's hits.
      users.value = [];
      return;
    }
    await searchUser();
  },
  { debounce: 1000 },
);

function displayName(user: Partial<User>) {
  const n = user.name?.trim();
  if (n) return n;
  return user.username ? `@${user.username}` : "";
}
</script>

<template>
  <div class="h-shv overflow-hidden pt-8">
    <div>
      <FormsFormInput
        v-model="search"
        :input-type="HTMLInputType.Text"
        name="search"
        autocomplete="off"
        :spellcheck="false"
        variant="search"
        prepend-icon="line-md:search-twotone"
        :placeholder="t('explore.placeholder')"
        class="!mb-0"
      />
    </div>

    <div class="h-[calc(100svh_-_14rem)] overflow-y-auto pb-4">
      <AppEmptyData
        v-if="show"
        :message="t('explore.no_results')"
        class="[&_.text-main]:!text-slate-300 [&_p.text-main]:!text-slate-300"
      />

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="user in users"
          :key="user.id"
          :to="app_routes.messages.chat(user.id!)"
          class="flex min-h-[3.5rem] items-center gap-3 rounded-lg border border-white/5 bg-[#1a202c] px-3 py-3 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
        >
          <div class="w-10 shrink-0">
            <AppUserAvatar
              :src="user.img"
              :alt="displayName(user)"
              :width="40"
              :height="40"
              img-class="avatar h-10 w-10"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 items-center gap-1.5 text-white">
              <span class="truncate font-medium">{{ displayName(user) }}</span>
              <Icon
                v-if="user.verified"
                icon="ic:twotone-verified"
                class="shrink-0 text-violet-400"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="user.name?.trim() && user.username"
              class="truncate text-sm text-slate-400"
            >
              @{{ user.username }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
