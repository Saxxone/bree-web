<script lang="ts" setup>
interface Props {
  audio: string;
  controls?: boolean;
  autoplay?: boolean;
}

const props = defineProps<Props>();

const audio_player = ref<HTMLAudioElement | null>(null);
const is_playing = ref(false);
const current_time = ref(0);
const duration = ref(0);

function togglePlay() {
  if (audio_player.value) {
    if (is_playing.value) {
      audio_player.value.pause();
    } else {
      audio_player.value.play();
    }
    is_playing.value = !is_playing.value;
  }
}

// function seekTo(event: Event) {
//   const target = event.target as HTMLInputElement;
//   const newTime = parseFloat(target.value);
//   if (audio_player.value) {
//     audio_player.value.currentTime = newTime;
//   }
// }

const seekToWaveform = (percentage: number) => {
  if (audio_player.value) {
    audio_player.value.currentTime = audio_player.value.duration * percentage;
  }
};

const current_time_formatted = computed(() => {
  return formatTime(current_time.value);
});

const duration_formatted = computed(() => {
  return formatTime(duration.value);
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  return formattedTime;
};

onMounted(() => {
  if (audio_player.value) {
    audio_player.value.addEventListener("timeupdate", () => {
      current_time.value = audio_player.value?.currentTime || 0;
    });

    audio_player.value.addEventListener("loadedmetadata", () => {
      duration.value = audio_player.value?.duration || 0;
    });
  }
});
</script>

<template>
  <div class="flex items-center space-x-2 py-3 px-2">
    <audio
      ref="audio_player"
      :src="props.audio"
      :controls="false"
      :autoplay="props.autoplay"
    />

    <button
      class="w-10 h-10 flex items-center justify-center mr-2 rounded-full bg-purple-200 hover:bg-purple-300 transition-colors duration-300"
      @click="togglePlay"
    >
      <Icon
        v-if="is_playing"
        class="text-purple-600"
        icon="line-md:play-twotone"
      />
      <Icon
        v-else
        icon="line-md:play-to-pause-transition"
        class="text-purple-600"
      />
    </button>

    <div class="flex-grow relative">
      <AppAudioWaveForm :src="props.audio" @update:progress="seekToWaveform" />
    </div>

    <div>{{ current_time_formatted }} / {{ duration_formatted }}</div>
  </div>
</template>
