'use client';
import { useState } from 'react';

export default function PDFSummaryPage() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSummary('');
        setError('');
        setLoading(true);

        const fileInput = (e.currentTarget.elements.namedItem('file') as HTMLInputElement);
        const file = fileInput?.files?.[0];
        const plan = 'free'; // hardcoded for now

        if (!file) {
            setError('Please upload a PDF file.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('plan', plan);

        try {
            const res = await fetch('/api/summarize/', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                try {
                    const parsed = JSON.parse(errText);
                    setError(parsed.error || 'Something went wrong.');
                } catch {
                    setError(errText);
                }
                setLoading(false);
                return;
            }

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                result += decoder.decode(value, { stream: true });
                setSummary((prev) => prev + decoder.decode(value));
            }

        } catch (err) {
            console.error(err);
            setError('Failed to upload or summarize PDF.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow ">
            <h1 className="text-2xl font-semibold mb-4">PDF Summarizer</h1>

            <form onSubmit={handleUpload} className="space-y-4">
                <input type="file" name="file" accept="application/pdf" required />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Summarizing...' : 'Upload & Summarize'}
                </button>
            </form>

            {error && (
                <p className="mt-4 text-red-600">{error}</p>
            )}

            {summary && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-black">
                    <h2 className="font-semibold mb-2">Summary:</h2>
                    <pre className="whitespace-pre-wrap text-black">{summary}</pre>
                </div>
            )}
        </div>
    );
}
