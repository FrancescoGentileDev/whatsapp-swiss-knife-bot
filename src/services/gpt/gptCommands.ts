import { Configuration, OpenAIApi } from "openai";
import { oggToMp3 } from "../../ffmpegService";
import path from 'path';
import fs from "fs";
import { GptMessage, GptRequest } from './gptRequest.class';
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const singleRequest = async (prompt: string) => {
  let gptRequest: GptRequest = new GptRequest();

  gptRequest.addUserMessage(prompt);

  let respose = await openai.createChatCompletion(gptRequest.getRequest());

  return respose.data.choices[0].message!.content
}

const chatRequest = async (messages: GptMessage[]) => {
  let gptRequest: GptRequest = new GptRequest();

  messages.forEach((message) => {
    if (!message.fromMe) {
      console.log(message.author)
      gptRequest.addUserMessage((message.author !== undefined ?  "["+message.author + "]: " : '') + message.message);
    } else {
      gptRequest.addAssistantMessage(message.message);
    }
  });
  console.log(`
  
  
  `)
  console.log(messages)

  let respose = await openai.createChatCompletion(gptRequest.getRequest());

  return respose.data.choices[0].message!.content

}


const generateImage = async (prompt: string) => {
  let response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "512x512",
    response_format: "url",
  })
  return response.data.data[0].url as string
}




const transcribeVoice = async (audio: string, extension: string) => {

  let mp3File = await oggToMp3(audio, extension);

  console.log("fromgptservice", path.join(__dirname, "../../", mp3File))

  let file: any = fs.createReadStream(mp3File)

  let response = await openai.createTranscription(file, "whisper-1")
  fs.unlinkSync( path.join(__dirname, "../../", mp3File));
  return response.data.text

}

export { singleRequest, generateImage, transcribeVoice, chatRequest }


