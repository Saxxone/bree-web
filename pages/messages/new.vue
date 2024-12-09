<script setup lang="ts">
import app_routes from "~/utils/routes";
import { HTMLInputType } from "~/types/types";
import { useGlobalStore } from "~/store/global";
import { useUsersStore } from "~/store/users";

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
const current_page = ref(0);
const skip = computed(() => take.value * current_page.value);
const users = ref();
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
    if (!search.value?.length) return;
    await searchUser();
  },
  { debounce: 1000 },
);
</script>

<template>
  <div class="h-shv overflow-hidden">
    <div>
      <FormsFormInput
        v-model="search"
        :input-type="HTMLInputType.Text"
        name="search"
        autocomplete="off"
        prepend-icon="line-md:search-twotone"
        :placeholder="t('explore.placeholder')"
      />
    </div>

    <div class="h-[calc(100svh_-_14rem)] overflow-y-auto pb-4">
      <AppEmptyData v-if="show" :message="t('explore.no_results')" />

      <div v-else>
        <NuxtLink
          v-for="user in users"
          :key="user.id"
          :to="app_routes.messages.chat(user.id)"
          class="flex space-x-4 items-center"
        >
          <div class="w-10 shrink-0">
            <NuxtImg :src="user.img" class="avatar h-10 w-10" />
          </div>
          <div>
            <div class="text-main">{{ user.name }}</div>
            <div
              class="truncate w-11/12 text-muted text-ellipsis overflow-x-hidden"
            >
              {{ user.username }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
