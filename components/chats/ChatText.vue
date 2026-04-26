<script lang="ts" setup>
import { useCryptoStore } from "~/store/crypto";
import type { ChatEnvelope, DateString } from "~/types/chat";

interface Props {
  envelope: ChatEnvelope | null | undefined;
  senderIdentityKeyCurve25519: string | null | undefined;
  senderDeviceId: string | null | undefined;
  meta: {
    created_at: DateString;
  };
}

const props = defineProps<Props>();
const emit = defineEmits(["error"]);
const { t } = useI18n();

const cryptoStore = useCryptoStore();
const text = ref<string>("");
const inboundPlaintext = inject<Map<string, string>>(
  "inboundPlaintext",
  new Map(),
);
const persistInboundPlaintext = inject<
  (envelopeId: string, plaintext: string) => void
>("persistInboundPlaintext", () => {});

watch(
  () =>
    [
      props.envelope?.id,
      props.envelope?.ciphertext,
      props.senderDeviceId,
    ] as const,
  async () => {
    const envelopeId = props.envelope?.id;
    const cached = envelopeId ? inboundPlaintext.get(envelopeId) : undefined;
    if (cached) {
      text.value = cached;
      return;
    }
    if (
      !props.envelope?.ciphertext ||
      !props.senderDeviceId ||
      !props.senderIdentityKeyCurve25519
    ) {
      text.value = t("security.message_unreadable");
      return;
    }
    try {
      const plaintext = await cryptoStore.decrypt({
        senderDeviceId: props.senderDeviceId,
        senderIdentityKeyCurve25519: props.senderIdentityKeyCurve25519,
        ciphertext: props.envelope.ciphertext,
        messageType: props.envelope.messageType,
      });
      text.value = plaintext;
      if (envelopeId) {
        persistInboundPlaintext(envelopeId, plaintext);
      }
    } catch (error) {
      // Olm raises on duplicate/out-of-order messages; surface a stable
      // placeholder so the thread renders instead of throwing.
      text.value = t("security.message_unreadable");
      emit("error", error);
    }
  },
  { immediate: true },
);
</script>

<template>
  <p class="text-wrap break-words m-0 px-3 py-2">{{ text }}</p>
</template>
