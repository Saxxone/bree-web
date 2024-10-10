<script lang="ts" setup>
import type { Chat } from "~/types/chat";
import type { User } from "~/types/user";

interface Props {
  content: string;
  dir: "ltr" | "rtl";
}

const props = defineProps<Props>();
</script>

<template>
  <div class="p-4 rounded-md">
    <p>{{ props.content }}</p>
  </div>
</template>
