export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, provider, userApiKey } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Use user's key if provided, otherwise fall back to server key
        const apiKey = userApiKey || process.env.DEFAULT_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'No API key available. Please provide your own API key.' });
        }

        const baseUrl = process.env.DEFAULT_BASE_URL || 'https://openrouter.ai/api/v1';
        const model = process.env.DEFAULT_MODEL || 'openrouter/free';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.SITE_URL || 'https://ankiflash.vercel.app',
            'X-Title': 'Anki Flash - AI Flashcard Generator'
        };

        const body = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8000
        };

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: `API Error: ${err.substring(0, 300)}` });
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        return res.status(200).json({ text });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
