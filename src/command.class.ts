import { Chat, Message } from "whatsapp-web.js";
import * as _ from "lodash"

export class Command {
    static readonly commandIdentifier: string = "!"
    command: string = "";
    prompt: string = "";

    constructor(private message: Message, private chat: Chat, private funzione: () => string) {
        let messSplitted = _.cloneDeep(message).body.split(" ");

        if (messSplitted[0].startsWith('!') && messSplitted[0].length > 1) {
            this.command = messSplitted[0]

            this.prompt = message.body.slice(0, this.command.length)
        }

    }

}