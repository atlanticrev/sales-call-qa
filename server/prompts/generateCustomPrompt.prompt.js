export function generateCustomPrompt(prompt, transcript) {
    return `
${prompt}

Транскрипт:
${transcript}
`;
}
