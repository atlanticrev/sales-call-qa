export function toTime(secs) {
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export function segmentsToText(segments) {
  return segments
    .map(s => `[${toTime(s.start)}] ${s.speaker}: ${s.text}`)
    .join("\n");
}
