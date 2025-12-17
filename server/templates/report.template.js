import { toTime } from "../utils/time.js";

export function renderReport(report, segments) {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: Arial; font-size: 12px; margin: 32px; }
table { width:100%; border-collapse: collapse; }
td, th { border:1px solid #ccc; padding:6px; }
h1,h2 { margin-top:20px; }
</style>
</head>
<body>

<h1>Отчёт по звонку</h1>
<b>Оценка:</b> ${report.call_score}/10

<h2>Резюме</h2>
${report.summary}

<h2>Критерии</h2>
<table>
${Object.entries(report.criteria).map(
  ([k,v]) => `<tr><td>${k}</td><td>${v.score}</td><td>${v.comment}</td></tr>`
).join("")}
</table>

<h2>Ошибки</h2>
<ul>${report.mistakes.map(x=>`<li>${x}</li>`).join("")}</ul>

<h2>Рекомендации</h2>
<ul>${report.recommendations.map(x=>`<li>${x}</li>`).join("")}</ul>

<h2>Транскрипт</h2>
<table>
${segments.map(s =>
  `<tr><td>${toTime(s.start)}</td><td>${s.speaker}</td><td>${s.text}</td></tr>`
).join("")}
</table>

</body>
</html>
`;
}
