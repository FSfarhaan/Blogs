import { Client } from "@notionhq/client";
import { getRequiredEnv } from "@/lib/env";

export const notion = new Client({
  auth: getRequiredEnv("NOTION_API_KEY"),
});

export const NOTION_DATA_SOURCE_ID = getRequiredEnv("NOTION_DATA_SOURCE_ID");

function isRetryableNotionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorText = `${error.name} ${error.message}`;

  return (
    errorText.includes("Connect Timeout") ||
    errorText.includes("UND_ERR_CONNECT_TIMEOUT") ||
    errorText.includes("fetch failed")
  );
}

export async function withNotionRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !isRetryableNotionError(error)) {
        throw error;
      }

      const delayMs = 400 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
