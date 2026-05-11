import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    let body;
    try {
        body = await req.json();
    } catch (err) {
        console.error('Invalid JSON body:', err);
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { messages } = body || {};
    console.log('Received messages:', messages);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Missing or empty `messages` in request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let completion;
    try {
        completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });
    } catch (err) {
        console.error('OpenAI API error:', err);
        const status = err?.status || 500;
        let message = err?.message || 'OpenAI API error';
        
        // Provide helpful error messages
        if (status === 429) {
            message = 'OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing';
        } else if (status === 401) {
            message = 'Invalid OpenAI API key. Please check your .env file';
        }
        
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    console.log('Completion:', completion);
    console.log('completion.choices[0].message:', completion.choices && completion.choices[0] && completion.choices[0].message);

    return new Response(JSON.stringify({
        reply: completion.choices && completion.choices[0] && completion.choices[0].message
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}