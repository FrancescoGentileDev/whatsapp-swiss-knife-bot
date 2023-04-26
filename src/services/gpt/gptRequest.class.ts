import { ChatCompletionRequestMessage, CreateChatCompletionRequest } from "openai";

export class GptRequest {
    static readonly model: string = "gpt-3.5-turbo";
    static readonly max_tokens = 400;
    static readonly temperature = 1.0;
    private messages: ChatCompletionRequestMessage[] = [];

    constructor(starterPrompt: string = "Sei un ottimo assistente che risponde come ste stesse parlando con degli amici, risponderai solo in italiano, sarai all'interno di un gruppo di messaggistica. Potrebbe capitare che prima del messaggio sia presente il nome dell'utente che ha scritto il messaggio in questa forma: '[nome]: messaggio' ricorda gli autori del messaggio e rispondi di conseguenza") {
        this.messages.push({
            role: "system",
            content: starterPrompt,
        });
    }
    addUserMessage(message: string) {
        this.messages.push({
            role: "user",
            content: message,
        });
    }

    addAssistantMessage(message: string) {
        this.messages.push({
            role: "assistant",
            content: message,
        });
    }

    getRequest(): CreateChatCompletionRequest {
        return {
            model: GptRequest.model,
            max_tokens: GptRequest.max_tokens,
            temperature: GptRequest.temperature,
            messages: this.messages,
        };
    }
    changeStartPrompt(newPrompt: string) {
        this.messages[0].content = newPrompt;
    }

}


export interface GptMessage {
    message: string;
    fromMe?: boolean;
    author?: string;
}
