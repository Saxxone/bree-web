<script lang="ts" setup>
import type { Chat } from "~/types/chat";
import type { User } from "~/types/user";

interface Props {
  content: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div>
    <p>{{ props.content }}</p>
  </div>
</template>
