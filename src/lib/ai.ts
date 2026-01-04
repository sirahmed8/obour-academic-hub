import { createOpenAI } from "@ai-sdk/openai";

// Configure the OpenAI provider to use Vercel AI Gateway
export const openai = createOpenAI({
  baseUrl: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY,
  headers: {
    // Optional: Add any specific headers if required by the gateway
  },
});
