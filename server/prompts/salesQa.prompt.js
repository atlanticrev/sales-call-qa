export function salesQaPrompt(transcript) {
  return `
Ты — руководитель отдела продаж.
Оцени качество телефонного звонка менеджера с клиентом.

Верни ТОЛЬКО валидный JSON:

{
  "call_score": number,
  "summary": string,
  "criteria": {
    "greeting": {"score":0|1,"comment":string},
    "needs": {"score":0|1,"comment":string},
    "presentation": {"score":0|1,"comment":string},
    "objections": {"score":0|1,"comment":string},
    "closing": {"score":0|1,"comment":string}
  },
  "mistakes": string[],
  "strengths": string[],
  "recommendations": string[],
  "best_quotes": [{"time":"MM:SS","speaker":string,"text":string}]
}

Транскрипт:
${transcript}
`;
}
