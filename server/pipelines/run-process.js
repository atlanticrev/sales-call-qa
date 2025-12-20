import { transcribe } from "../services/stt.service.js";
import { analyzeCall } from "../services/llm.service.js";
import { generatePdf } from "../services/pdf.service.js";
import { segmentsToText } from "../utils/time.js";

export async function runProcess({
    jobId,
    buffer,
    filename,
    prompt,
    progress,
    store,
}) {
    try {
        progress.report({ stage: "stt", message: "Transcribing audio" });

        const stt = await transcribe(buffer, filename, progress);

        progress.report({
            stage: "stt",
            message: "Transcription completed",
            meta: { segmentsCount: stt.segments?.length },
        });

        progress.report({
            stage: "llm",
            message: "Preparing transcript",
        });

        const transcript = segmentsToText(stt.segments);

        progress.report({
            stage: "llm",
            message: "Analyzing conversation",
        });

        const report = await analyzeCall(prompt, transcript, progress);

        progress.report({
            stage: "pdf",
            message: "Generating PDF report",
        });

        const pdf = await generatePdf(report, stt.segments, progress);

        store.get(jobId).pdf = pdf;

        progress.report({
            stage: "done",
            message: "PDF is ready",
        });
    } catch (error) {
        progress.report({
            stage: "error",
            level: "error",
            message: error.message || "Processing failed",
        });
    }
}
