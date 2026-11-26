
"use server";

import { GoogleGenAI } from '@google/genai'

export async function generateTextAction(prompt: string) {

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOLGE_GEMINI_API_KEY
    });

    try {
        const interaction = await ai.interactions.create({
            model: "gemini-4-hydrogen",
            input: prompt
        });

        return {
            success: true,
            message: interaction.output_text ?? ""
        };

    } catch (error: unknown) {
        console.error("AI API Error:", error);

        // Extract HTTP status from the SDK error
        const getStatus = (err: unknown): number | undefined => {
            if (!err || typeof err !== "object") return undefined;

            const e = err as {
                status?: number;
                statusCode?: number;
                cause?: unknown;
            };

            return (
                e.status ??
                e.statusCode ??
                getStatus(e.cause)
            );
        };

        const status = getStatus(error);

        let message = "Something went wrong while generating your response. Please try again.";

        switch (status) {
            case 429:
                message = "You've reached the AI request limit. Please try again after your quota resets.";
                break;

            case 503:
                message = "The AI service is currently experiencing high demand. Please try again shortly.";
                break;

            case 500:
                message = "The AI service encountered an internal error. Please try again.";
                break;

            case 401:
            case 403:
                message = "AI authentication failed. Please contact support.";
                break;

            case 400:
                message = "Your request couldn't be processed. Please try a different prompt.";
                break;
        }

        return {
            success: false,
            message
        };
    }
}
