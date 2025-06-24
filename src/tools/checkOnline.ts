import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/chat/completions";

export const checkOnline = async ({
  apiKey,
  query,
  broaderContext = "",
}: {
  apiKey: string;
  query: string;
  broaderContext?: string;
}) => {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "perplexity/sonar",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Research user query on the internet. take the broader context in consideration. Give both answer and citations.",
            },
            {
              type: "text",
              text: `Broader context:\n${broaderContext}`,
            },
            {
              type: "text",
              text: `Query:\n${query}`,
            },
          ],
        },
      ],
    });

    if (response?.choices[0].message.content) {
      return JSON.stringify({
        content: response.choices[0].message.content,
        citations: response.choices[0].message.annotations,
      });
    }
    return JSON.stringify({ content: "No content found from online search." });
  } catch (error) {
    console.error("Error during online check:", error);
    return JSON.stringify({
      content: `An error occurred during online check: ${error.message}`,
    });
  }
};

export const checkOnlineTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "checkOnline",
    description: "Perform an internet search for facts.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to search for.",
        },
        broaderContext: {
          type: "string",
          description: "The broader context of the query.",
        },
      },
      required: ["query"],
    },
  },
};
