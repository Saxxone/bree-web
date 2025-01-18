<script setup lang="ts">
const props = defineProps({
  adClient: {
    type: String,
    required: true,
  },
  adSlot: {
    type: String,
    required: true,
  },
  adFormat: {
    type: String,
    default: "fluid",
  },
  adLayoutKey: {
    type: String,
    default: "",
  },
});

const adLoaded = ref(false);

onMounted(() => {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.adClient}`;
  script.crossOrigin = "anonymous";

  script.onload = () => {
    if (!window.adsbygoogle) {
      window.adsbygoogle = [];
    }
    window.adsbygoogle.push({});
    adLoaded.value = true;
  };
  document.head.appendChild(script);
});
</script>

<template>
  <div v-if="adLoaded">
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      :data-ad-layout-key="adLayoutKey"
    />
  </div>
</template>
