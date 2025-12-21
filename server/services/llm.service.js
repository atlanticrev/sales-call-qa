// import OpenAI from "openai";
import { generateDefaultPrompt } from "../prompts/salesQa.prompt.js";
import { generateCustomPrompt } from "../prompts/generateCustomPrompt.prompt.js";
import { extractJson } from "../utils/json.js";

const provider = process.env.LLM_PROVIDER;

// ---------- OpenAI ----------
// const openaiClient = provider === "openai"
//   ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
//   : null;

// ---------- Ollama ----------
const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

/**
 * @param {string | undefined} prompt
 * @param {string} transcript
 * @param {ProgressReporter} progress
 */
export async function analyzeCall(prompt, transcript, progress) {
  progress.report({
    stage: "llm",
    message: "Preparing prompt for LLM",
  });

  const finalPrompt = prompt
    ? generateCustomPrompt(prompt, transcript)
    : generateDefaultPrompt(transcript);

  // if (provider === "openai") {
  //   progress.report({
  //     stage: "llm",
  //     message: "Analyzing with OpenAI",
  //   });
  //
  //   return analyzeWithOpenAI(finalPrompt, progress);
  // }

  if (provider === "ollama") {
    progress.report({
      stage: "llm",
      message: "Analyzing with Ollama",
    });

    return analyzeWithOllama(finalPrompt, progress);
  }

  progress.report({
    stage: "llm",
    level: "error",
    message: `Unknown LLM_PROVIDER: ${provider}`,
  });

  throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
}

// ===== OpenAI =====
// async function analyzeWithOpenAI(prompt, progress) {
//   progress.report({
//     stage: "llm",
//     level: "debug",
//     message: "Sending request to OpenAI",
//   });
//
//   const response = await openaiClient.chat.completions.create({
//     model: process.env.OPENAI_MODEL,
//     messages: [
//       { role: "system", content: "Ты эксперт по оценке качества продаж." },
//       { role: "user", content: prompt }
//     ],
//     temperature: 0.2
//   });
//
//   progress.report({
//     stage: "llm",
//     message: "OpenAI response received",
//   });
//
//   return extractJson(response.choices[0].message.content);
// }

// ===== Ollama =====
async function analyzeWithOllama(prompt, progress) {
  progress.report({
    stage: "llm",
    level: "debug",
    message: "Sending request to Ollama",
  });

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    progress.report({
      stage: "llm",
      level: "error",
      message: `Ollama request failed with status ${res.status}`,
    });

    throw new Error(`Ollama failed: ${res.status}`);
  }

  progress.report({
    stage: "llm",
    level: "debug",
    message: "Ollama response received, extracting JSON",
  });

  const data = await res.json();

  progress.report({
    stage: "llm",
    message: "LLM analysis completed",
  });

  return data.response;

  // return extractJson(data.response);
}
