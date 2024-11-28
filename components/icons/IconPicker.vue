<script setup lang="ts">
interface Props {
    icon: string
}

const props = defineProps<Props>()
</script>

<template>
    <div>
        <Icon v-if="icon === 'person'" icon="line-md:person-twotone" />
        <Icon v-if="icon === 'chat_bubble'"  icon="line-md:chat-bubble-twotone" />
        <Icon v-if="icon === 'home'" icon="line-md:home-simple-twotone" />
        <Icon v-if="icon === 'search'" icon="line-md:search-twotone" />
        <Icon v-if="icon === 'bell'" icon="line-md:bell-twotone-loop" />
        <Icon v-if="icon === 'arrow-left'" icon="line-md:arrow-left" />
        <Icon v-if="icon === 'close'" icon="line-md:close-small" />
    </div>
</template>

