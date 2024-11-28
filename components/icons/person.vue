<script setup lang="ts">
import { defineComponent } from 'vue';

defineComponent({
  name: 'LineMdPersonTwotone',
});
</script>
<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
		<g fill="currentColor" fill-opacity="0" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
			<path stroke-dasharray="20" stroke-dashoffset="20" d="M12 5c1.66 0 3 1.34 3 3c0 1.66 -1.34 3 -3 3c-1.66 0 -3 -1.34 -3 -3c0 -1.66 1.34 -3 3 -3Z">
				<animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="20;0" />
			</path>
			<path stroke-dasharray="36" stroke-dashoffset="36" d="M12 14c4 0 7 2 7 3v2h-14v-2c0 -1 3 -3 7 -3Z">
				<animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.5s" values="36;0" />
			</path>
			<animate fill="freeze" attributeName="fill-opacity" begin="1.1s" dur="0.15s" values="0;0.3" />
		</g>
	</svg>
</template>
