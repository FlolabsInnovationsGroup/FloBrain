import * as Sentry from "@sentry/nextjs";

export function setBrainConversationId(chatId: number | string | null | undefined) {
  if (!chatId) return;
  Sentry.setConversationId(`chat_${chatId}`);
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
