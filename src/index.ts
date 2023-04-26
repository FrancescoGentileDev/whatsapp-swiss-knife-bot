import qrCode from "qrcode-terminal"

import express from "express"
import { singleRequest, generateImage, transcribeVoice, chatRequest } from "./services/gpt/gptCommands"
import { Client, LocalAuth, MessageMedia, Chat, Contact } from "whatsapp-web.js";
import { GptMessage } from "./services/gpt/gptRequest.class";
import { MinchiateService } from "./services/others/minchiate.service";

const res = require("express/lib/response");
require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("right");
});


export const ClientInstance = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // executablePath: "/usr/bin/google-chrome-stable",
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

ClientInstance.on("qr", (qr: string) => {
  qrCode.generate(qr, { small: true });
});

ClientInstance.on("ready", () => {
  console.log("Client is ready!");
});
//120363023135598904@g.us dnd
ClientInstance.on("message", async (message) => {
  let minchiate: MinchiateService = new MinchiateService(ClientInstance, message)
  minchiate.executeAll()

});


ClientInstance.on("message", async (message) => { //gpt
  let chat = await message.getChat();

  let prompt: string | string[] = message.body.split(" ");
  prompt.shift()
  prompt = prompt.join(" ")

  if (message.body.startsWith("!gpt") || message.body.startsWith("!cgpt")) {
    chat.sendStateTyping()

    let gptResponse: string = "";

    let timer = setTimeout(() => {
      chat.sendStateTyping()
    }, 2500)
    try {
      gptResponse = await singleRequest(prompt)
    }
    catch (e) {
      console.log(e)
      gptResponse = "Le api attualmente non sono disponibili, riprova più tardi"
      clearTimeout(timer)
      chat.clearState()
    }
    finally {
      clearTimeout(timer)
      chat.clearState()
    }

    message.reply(gptResponse)

  }
  else if (message.body.startsWith("!image")) {
    chat.sendStateTyping()
    let response = await generateImage(prompt)
    console.log(response)
    const media = await MessageMedia.fromUrl(response)
    chat.sendMessage(media)
    chat.clearState()
  }
  else if (message.body.startsWith("!transcribe") || message.body.startsWith("!trascrivi")) {
    if (message.hasQuotedMsg) {
      let quotedMessage = await message.getQuotedMessage()
      if (quotedMessage.hasMedia) {
        chat.sendStateTyping()

        let media = await quotedMessage.downloadMedia();
        let response = await transcribe(media)

        let reply =
          `Ecco la trascrizione del messaggio: 

${response}
`
        quotedMessage.reply(reply)
        chat.clearState()

      }
    }
  }


  let lastQuoted = await message.getQuotedMessage()
  //CHAT IDENTIFIER
  if (lastQuoted && lastQuoted.fromMe) {
    let messages: GptMessage[] = [];
    let tmpMessage = message;

    let contact = await message.getContact()

    if (message.hasMedia) {
      let media = await message.downloadMedia();
      let transcription = await transcribe(media);
      if (transcription) {
        messages.push({
          message: transcription,
          fromMe: message.fromMe,
          author: contact.pushname
        })
      }
      else {
        messages.push({
          message: message.body,
          fromMe: message.fromMe,
          author: contact.pushname
        })
      }
    }
    else {
      messages.push({
        message: message.body,
        fromMe: message.fromMe,
        author: contact.pushname
      })
    }

    console.log(messages)
    while (tmpMessage) {
      console.info("getting quoted message", tmpMessage.body)
      let message = await tmpMessage.getQuotedMessage()
      let contat: Contact | undefined = undefined;
      if (message)
        contat = await message.getContact()

      if (message) {
        if (message.hasMedia) {
          let media = await message.downloadMedia();

          let transcription = await transcribe(media);
          if (transcription) {
            messages.push({
              message: transcription,
              fromMe: message.fromMe,
              author: contat!.pushname
            })
          }
          else {
            messages.push({
              message: message.body,
              fromMe: message.fromMe,
              author: contat!.pushname
            })
          }
        }
        else {
          messages.push({
            message: message.body,
            fromMe: message.fromMe,
            author: contat!.pushname
          })
        }
      }
      tmpMessage = message
    }
    messages.reverse()

    if (messages[0].message.startsWith("!gpt") || messages[0].message.startsWith("!cgpt")) {
      console.log(messages[0].message)
      chat.sendStateTyping()
      let response = await chatRequest(messages)
      message.reply(response)
      chat.clearState()

    }
  }

});

/*
client.on("message",async message => {
  let chat= await message.getChat();
  if(message.body.startsWith("!")){
  chat.sendMessage("")
}})
 */
ClientInstance.initialize();
app.listen(8000, () => {
  console.log("app listening on port" + process.env.PORT);
});

async function transcribe(media: MessageMedia) {
  let mimType = media.mimetype
  console.log(media.mimetype)
  if (mimType.startsWith("audio")) {
    let extension = mimType.split(";")[0];
    extension = extension.split("/")[1];
    return await transcribeVoice(media.data, extension)
  }
  else
    return undefined
}

