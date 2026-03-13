import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/translate";

// Simple in-memory cache
const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { text, source = "en", target = "pt" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const cacheKey = `${source}:${target}:${text.toLowerCase().trim()}`;

    if (cache.has(cacheKey)) {
      return NextResponse.json({ translatedText: cache.get(cacheKey) });
    }

    const result = await translate(text, source, target);
    cache.set(cacheKey, result.translatedText);

    // Prevent cache from growing too large
    if (cache.size > 5000) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
