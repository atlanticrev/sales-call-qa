import { PromptEditor } from './_components/prompt-editor';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
	return <PromptEditor />;
}
