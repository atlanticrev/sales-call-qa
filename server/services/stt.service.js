import { Agent, fetch } from "undici";

const STT_URL = process.env.STT_URL;

const agent = new Agent({
  headersTimeout: 0,
  bodyTimeout: 0
});

export async function transcribe(buffer, filename) {
  console.log("▶ sending audio file to LLM (starting)...");

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);

  const res = await fetch(STT_URL, {
    method: "POST",
    body: form,
    dispatcher: agent
  });

  console.log("▶ sending audio file to LLM (ending)...");

  if (!res.ok) {
    throw new Error(`STT failed: ${res.status}`);
  }

  return res.json();
}
