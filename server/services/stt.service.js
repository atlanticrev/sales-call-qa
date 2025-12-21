import { Agent, fetch } from "undici";

const STT_URL = process.env.STT_URL;

const agent = new Agent({
  headersTimeout: 0,
  bodyTimeout: 0,
});

/**
 * @param {Buffer} buffer
 * @param {string} filename
 * @param {ProgressReporter} progress
 */
export async function transcribe(buffer, filename, progress) {
  progress.report({
    stage: "stt",
    message: "Preparing audio file for transcription",
  });

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);

  progress.report({
    stage: "stt",
    level: "debug",
    message: "Transcribing audio with STT service",
    meta: { filename },
  });

  const res = await fetch(STT_URL, {
    method: "POST",
    body: form,
    dispatcher: agent,
  });

  if (!res.ok) {
    progress.report({
      stage: "stt",
      level: "error",
      message: `STT request failed with status ${res.status}`,
    });

    throw new Error(`STT failed: ${res.status}`);
  }

  progress.report({
    stage: "stt",
    message: "STT service responded, parsing result",
  });

  const result = await res.json();

  progress.report({
    stage: "stt",
    message: "Audio transcription completed",
    meta: {
      segmentsCount: result?.segments?.length,
    },
  });

  return result;
}
