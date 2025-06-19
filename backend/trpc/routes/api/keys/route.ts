import { publicProcedure } from "../../../create-context";
import { z } from "zod";

// Store API keys securely in the backend
const API_KEYS = {
  openrouter: "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",
  perplexity: "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"
};

// This procedure returns API keys to authenticated clients
// In a production environment, you would add authentication checks here
export default publicProcedure
  .input(
    z.object({
      service: z.enum(["openrouter", "perplexity"])
    })
  )
  .query(({ input }) => {
    // In a real production app, you would:
    // 1. Verify the user is authenticated
    // 2. Check if the user has permission to access this key
    // 3. Log the access for audit purposes
    // 4. Consider rate limiting key requests
    
    const apiKey = API_KEYS[input.service];
    
    if (!apiKey) {
      throw new Error(`API key for ${input.service} not found`);
    }
    
    return {
      apiKey,
      service: input.service
    };
  });