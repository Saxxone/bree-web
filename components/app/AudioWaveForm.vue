<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

interface Props {
  src: string;
  progress: number;
}

const props = defineProps<Props>();
const emit = defineEmits<(e: "update:progress", percentage: number) => void>();

const waveform_container = ref<HTMLDivElement | null>(null);
const waveform_canvas = ref<HTMLCanvasElement | null>(null);

const audio_context = new AudioContext();

onMounted(async () => {
  const audio_buffer = await fetchAudio(props.src);
  drawWaveform(audio_buffer);
});

watch(
  () => props.src,
  async (newSrc) => {
    if (newSrc) {
      const audio_buffer = await fetchAudio(newSrc);
      drawWaveform(audio_buffer);
    }
  },
);

// Watch for progress changes from parent
watch(
  () => props.progress,
  () => {
    // Redraw waveform to reflect progress
    if (props.src) {
      fetchAudio(props.src).then(drawWaveform);
    }
  },
);

const fetchAudio = async (src: string) => {
  const response = await fetch(src);
  const array_buffer = await response.arrayBuffer();
  const audio_buffer = await audio_context.decodeAudioData(array_buffer);
  return audio_buffer;
};

const drawWaveform = (audio_buffer: AudioBuffer) => {
  const canvas = waveform_canvas.value;
  const canvas_ctx = canvas?.getContext("2d");

  if (!canvas || !canvas_ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  canvas_ctx.clearRect(0, 0, width, height);

  const channelData = audio_buffer.getChannelData(0);
  const samplesPerPixel = Math.floor(channelData.length / width);

  // Calculate progress width
  const progressWidth = props.progress * width;

  canvas_ctx.fillStyle = "gray"; // Default waveform color

  for (let i = 0; i < width; i++) {
    const startIndex = i * samplesPerPixel;
    let maxVal = 0;

    for (let j = startIndex; j < startIndex + samplesPerPixel; j++) {
      const val = Math.abs(channelData[j]);
      if (val > maxVal) {
        maxVal = val;
      }
    }

    const barHeight = (maxVal * height) / 2;
    const y = height / 2 - barHeight / 2;

    // Apply progress color
    if (i <= progressWidth) {
      canvas_ctx.fillStyle = "purple"; // Progress color
    } else {
      canvas_ctx.fillStyle = "gray"; // Default color
    }

    canvas_ctx.fillRect(i, y, 1, barHeight);
  }
};

const seek = (event: MouseEvent) => {
  if (waveform_container.value) {
    const rect = waveform_container.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / waveform_container.value.offsetWidth;
    emit("update:progress", percentage);
  }
};
</script>

<template>
  <div
    ref="waveform_container"
    class="h-14 w-full cursor-pointer relative"
    @click="seek"
  >
    <canvas ref="waveform_canvas" class="w-full h-full" />
  </div>
</template>
