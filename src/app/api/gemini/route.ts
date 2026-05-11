import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // 1. Extract messages from the request body
        const body = await req.json();
        const { messages } = body;

        console.log('Received messages:', messages);

        // 2. Validate messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Missing or invalid messages array' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // 3. Call the Gemini model (Free Tier)
        console.log('Calling Gemini...');
        const result = streamText({
            model: google('gemini-1.5-flash'),
            messages,
        });

        console.log('Streaming response...');

        // 4. Return text stream response
        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Gemini API error:', error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return new Response(
                JSON.stringify({ error: 'Invalid JSON in request body' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Handle other errors
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.toString()
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}