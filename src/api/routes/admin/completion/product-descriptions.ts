import { Request, Response } from "express";
import { OpenAIStream, streamToResponse } from "ai";
import { Prompts } from "../../../../types/product-ai-tools";

const PROMPTS: Prompts = {
  fix_writing:
    "Fix spelling and grammar. Don't introduce new ideas, just fix the writing.",
  make_longer:
    "Make the text longer, without losing the original meaning. Get creative.",
  make_shorter:
    "Make as short as possbile, without losing the original meaning. Don't introduce any new ideas or words, but fix grammar and spelling.",
  improve_seo:
    "Paraphrase this product description using SEO best practices. Use active voice and short sentences to make the content more readable for potential shoppers in the context of the focus keyword: '{keyword}'. Text length may exceed 160 characters. The text should be unique and not copied from other sources. The focus keyword should be used 2-3 times in your output.",
};

export default async function (req: Request, res: Response): Promise<void> {
  // Create an OpenAI API client
  const openAiService = req.scope.resolve("openAiService");

  // Extract the relevant data from the request body
  const { messages, type, description, keyword } = req.body;

  // Set up the initial prompt
  let prompt = PROMPTS[type];

  if (type === "improve_seo") {
    prompt = prompt.replace("{keyword}", keyword);
  }

  // Add the prompt to the messages
  const userMessages = [
    {
      role: "user",
      content: "Prompt: " + prompt + " Description: " + description,
    },
  ];

  messages.push(...userMessages);

  // Ask OpenAI for a streaming chat completion given the prompt
  const completion = await openAiService.create(messages);

  // Set up response headers
  res.setHeader("Content-Type", "text/plain");

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(completion);

  // Pipe the stream to the response
  streamToResponse(stream, res);
}
