<script setup lang="ts">
import { defineComponent } from 'vue';

defineComponent({
  name: 'LineMdChatBubbleTwotone',
});
</script>
<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
		<path fill="currentColor" fill-opacity="0" stroke="currentColor" stroke-dasharray="72" stroke-dashoffset="72" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19.5v-15.5c0 -0.55 0.45 -1 1 -1h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-14.5Z">
			<animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.15s" values="0;0.3" />
			<animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;0" />
		</path>
	</svg>
</template>
