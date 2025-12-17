import { transcribe } from "../services/stt.service.js";
import { analyzeCall } from "../services/llm.service.js";
import { generatePdf } from "../services/pdf.service.js";
import { segmentsToText } from "../utils/time.js";

export default async function processRoute(app) {
  app.post("/", async (req, reply) => {
    req.log.info("process: start");

    const file = await req.file();
    if (!file) {
      req.log.warn("audio file not provided");
      return reply.code(400).send({ error: "audio required" });
    }

    req.log.info(
      { filename: file.filename, mimetype: file.mimetype },
      "file received"
    );

    const buffer = await file.toBuffer();
    req.log.debug({ size: buffer.length }, "buffer created");

    // 1️⃣ STT
    req.log.info("transcribing audio");
    const stt = await transcribe(buffer, file.filename);
    req.log.info(
      { segmentsCount: stt.segments?.length },
      "stt completed"
    );

    // 2️⃣ Text for LLM
    req.log.debug("creating text for LLM");
    const transcript = segmentsToText(stt.segments);

    // 3️⃣ Analysis
    req.log.info("analyzing call with LLM");
    const report = await analyzeCall(transcript);

    // 4️⃣ PDF
    req.log.info("generating PDF");
    const pdf = await generatePdf(report, stt.segments);

    req.log.info("sending PDF response");

    reply
      .header("Content-Type", "application/pdf")
      .send(pdf);
  });
}
