// import OpenAI from "openai";
import { salesQaPrompt } from "../prompts/salesQa.prompt.js";
import { extractJson } from "../utils/json.js";

const provider = process.env.LLM_PROVIDER;

// ---------- OpenAI ----------
// const openaiClient = provider === "openai"
//   ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
//   : null;

// ---------- Ollama ----------
const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

export async function analyzeCall(transcript) {
  const prompt = salesQaPrompt(transcript);

  // if (provider === "openai") {
  //   return analyzeWithOpenAI(prompt);
  // }

  if (provider === "ollama") {
    return analyzeWithOllama(prompt);
  }

  throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
}

// ===== OpenAI =====
// async function analyzeWithOpenAI(prompt) {
//   const response = await openaiClient.chat.completions.create({
//     model: process.env.OPENAI_MODEL,
//     messages: [
//       { role: "system", content: "Ты эксперт по оценке качества продаж." },
//       { role: "user", content: prompt }
//     ],
//     temperature: 0.2
//   });

//   return extractJson(response.choices[0].message.content);
// }

// ===== Ollama =====
async function analyzeWithOllama(prompt) {
  console.log("▶ analyzing with Ollama (starting)...");

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false
    })
  });

  console.log("▶ analyzing with Ollama (ending)...");

  const data = await res.json();
  
  return extractJson(data.response);
}
