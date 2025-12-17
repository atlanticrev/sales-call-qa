from fastapi import FastAPI, UploadFile, File
import whisper
import tempfile
import os

app = FastAPI()

print("🔄 Loading Whisper model...")
model = whisper.load_model("small")
print("✅ Whisper model loaded")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    print("File loaded [STT]")

    try:
        result = model.transcribe(
            tmp_path,
            language="ru",
            fp16=False
        )
        return {
            "text": result["text"],
            "segments": result["segments"]
        }
    finally:
        os.remove(tmp_path)
