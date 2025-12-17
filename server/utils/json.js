export function extractJson(text) {
  const start = text.indexOf("{");

  const end = text.lastIndexOf("}");
  
  if (start === -1 || end === -1) {
    throw new Error("Invalid JSON from LLM");
  }
  
  return JSON.parse(text.slice(start, end + 1));
}
