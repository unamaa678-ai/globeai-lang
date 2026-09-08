import * as deepl from "deepl-node";
import { localizeWithLLM } from "@/services/ai/claude";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

// Languages where idiomatic/dialect nuance matters more than DeepL's literal
// output — route these through the LLM localizer instead.
const LLM_PREFERRED_LANGS = new Set(["ar", "pt-BR"]);

export async function detectLanguage(text: string): Promise<string> {
  const result = await translator.translateText(text, null, "en-US");
  return result.detectedSourceLang;
}

export async function translateText(
  text: string,
  opts: { to: string; tone?: string }
): Promise<string> {
  if (LLM_PREFERRED_LANGS.has(opts.to)) {
    return localizeWithLLM({ text, targetLanguage: opts.to, tone: opts.tone });
  }

  const result = await translator.translateText(text, null, opts.to as deepl.TargetLanguageCode);
  return result.text;
}
