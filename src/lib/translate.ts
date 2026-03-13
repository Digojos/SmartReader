const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "https://libretranslate.com";
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || "";

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

export async function translate(
  text: string,
  source = "en",
  target = "pt"
): Promise<TranslationResult> {
  try {
    const body: Record<string, string> = {
      q: text,
      source,
      target,
      format: "text",
    };

    if (LIBRETRANSLATE_API_KEY) body.api_key = LIBRETRANSLATE_API_KEY;

    const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: 86400 }, // cache for 24h
    });

    if (!res.ok) throw new Error(`LibreTranslate error: ${res.status}`);

    const data = await res.json();
    return { translatedText: data.translatedText };
  } catch {
    // Fallback: MyMemory API (free, no key required)
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
    );
    const data = await res.json();
    return { translatedText: data.responseData.translatedText };
  }
}
