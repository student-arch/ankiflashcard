export default async function handler(req, res) {
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
        const { prompt, userApiKey } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const apiKey = userApiKey || process.env.IMAGE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'No image API key available.' });
        }

        const res_ = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.SITE_URL || 'https://ankiflash.vercel.app',
                'X-Title': 'Anki Flash'
            },
            body: JSON.stringify({
                model: process.env.IMAGE_MODEL || 'openai/dall-e-3',
                prompt,
                n: 1,
                size: '512x512'
            })
        });

        const data = await res_.json();
        const url = data.data?.[0]?.url || '';

        return res.status(200).json({ url });
    } catch (error) {
        console.error('Image generation error:', error);
        return res.status(500).json({ error: error.message || 'Image generation failed' });
    }
}
