import { transcribe } from "../services/stt.service.js";
import { analyzeCall } from "../services/llm.service.js";
import { generatePdf } from "../services/pdf.service.js";
import { segmentsToText } from "../utils/time.js";

export default async function processRoute(app) {
    app.post("/", async (req, reply) => {
        console.log("▶ process: start");

        const file = await req.file();
        console.log("▶ file received");

        if (!file) {
            return reply.code(400).send({ error: "audio required" });
        }

        const buffer = await file.toBuffer();
        console.log("▶ buffer size:", buffer.length);

        // 1️⃣ STT
        console.log('transcribing...');
        const stt = await transcribe(buffer, file.filename);
        console.log("▶ stt done");

        // 2️⃣ Text for LLM
        console.log('creating text for LLM...');
        const transcript = segmentsToText(stt.segments);

        // 3️⃣ Analysis
        console.log('analyzing call...');
        const report = await analyzeCall(transcript);

        // 4️⃣ PDF
        console.log('generating PDF...');
        const pdf = await generatePdf(report, stt.segments);

        console.log('answering with PDF file...');
        reply
            .header("Content-Type", "application/pdf")
            .send(pdf);
    });
}
