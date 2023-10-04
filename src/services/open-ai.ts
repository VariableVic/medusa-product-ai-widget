import OpenAI from "openai";
import { APIPromise } from "openai/core";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat";
import { Stream } from "openai/streaming";

export default class OpenAiService {
  private openai: OpenAI;

  constructor({}, options) {
    this.openai = new OpenAI({
      apiKey: options.api_key,
    });
  }

  async create(
    messages: ChatCompletionMessageParam[]
  ): Promise<APIPromise<Stream<ChatCompletionChunk>>> {
    return await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
    });
  }
}
