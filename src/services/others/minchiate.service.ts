import moment from "moment";
import { Chat, Client, Contact, Message, MessageMedia } from "whatsapp-web.js";
import { ClientInstance } from "../..";
import _ from "lodash";

export class MinchiateService {

    static readonly COMMAND_IDENTIFIER: string = "!";
    chat!: Chat;


    readonly functionMap: Map<string, Function> = new Map<string, Function>()
        .set('dndHour', this.dndHour)
        .set('valerio', this.valerio)
        .set('monaco', this.roll)
        .set('roll', this.bambina)
        .set('porcodio', this.porcodio)
        .set('madonna', this.madonna)
        .set('branna', this.branna)
        .set('fortune', this.fortune)
    contact!: Contact;

    constructor(
        private client: Client,
        private message: Message
    ) {

    }

    async executeAll() {
        this.chat = await this.message.getChat();
        this.contact = await this.message.getContact();
        if (this.message.body.startsWith(MinchiateService.COMMAND_IDENTIFIER)) {
            await this.dndHour();
            await this.valerio();
            await this.roll();
            await this.bambina();
            await this.porcodio();
            await this.madonna();
            await this.branna();
            await this.fortune();
            await this.monaco();
        }

        return true;
    }

    private async dndHour(): Promise<boolean> {

        //ORA
        if (this.checkCommand('ora')) {
            let dndgiorno = 4;
            let dndora = 21;
            let dndmin = 30;

            let datePositioning: Map<number, string> = new Map<number, string>()
                .set(0, " giorni")
                .set(1, " ore")
                .set(2, " minuti")
                .set(3, " secondi");

            let dnd = moment().day(dndgiorno).hour(dndora).minute(dndmin).second(0);

            if (moment().isAfter(dnd)) {
                dnd.add(1, 'week');
            }
            let diff = dnd.diff(moment(), 'seconds');

            let date: number[] = []



            let giorniRimanenti = Math.floor(diff / 86400);

            date.push(giorniRimanenti);

            let oreRimanenti = Math.floor((diff - giorniRimanenti * 86400) / 3600);

            date.push(oreRimanenti);

            let minutiRimanenti = Math.floor((diff - giorniRimanenti * 86400 - oreRimanenti * 3600) / 60);

            date.push(minutiRimanenti);

            let secondiRimanenti = diff - giorniRimanenti * 86400 - oreRimanenti * 3600 - minutiRimanenti * 60;

            date.push(secondiRimanenti);


            let finesessione = dnd.subtract(1, 'week').add(3, 'hours')

            if (moment().diff(finesessione, 'seconds') > 0) {

                let dateStr: string[] = []
                date.forEach((element, index) => {
                    if (element > 0) {
                        dateStr.push(element.toString() + datePositioning.get(index));
                    }
                })
                await this.client.sendMessage(this.chat.id._serialized,
                    "A dnd mancano: " + dateStr.join(', '));
            } else {
                await this.client.sendMessage(
                    this.chat.id._serialized,
                    ` *LA SESSIONE E' COMINCIATA COJONE! CORRI!*
			 Roll20: https://bit.ly/campagnaRoll20
			 Discord: https://bit.ly/DiscordDnD
			 MOVT
			 `
                );
            }
            return true;
        }
        return false;
    }

    private async valerio() {
        if (this.checkCommand('valerio')) {
            let frasivalerio = ["è indiscutibilmente un coglio", "hai ragione è un noob demmerda", "VALERIOO NON CACARE IL CAZZO", "AOOOOOOOOOOOOOOOOOOOOOOOOO", "Ma quanto è coglione?", '"Viene da destra".cit'];

            let rand = Math.floor(Math.random() * frasivalerio.length);

            await this.chat.sendMessage(frasivalerio[rand]);
            return true;
        }
        return false;
    }

    private async roll() {
        //ROLL
        let arr = this.message.body.split(/[ d+\-*\/]/gm);
        if (arr[0] === "!roll" || arr[0] === "!r" || arr[0] === "!tirameerdado") {
            if (arr[1] && arr[2]) {
                let tot = 0;
                let roll = [];

                //roll dice
                for (let i = 0; i < +arr[1]; i++) {
                    let result = Math.floor(Math.random() * +arr[2] + 1);
                    tot += result;
                    roll.push(result);
                }

                let string = "";
                //compose string
                for (let i = 0; i < +arr[1]; i++) {
                    string += roll[i];

                    if (i != +arr[1] - 1) string += " + ";
                }

                //create array operation
                let temp = this.message.body.split(/[^+\-*\/]/gm);
                let symbols = temp.filter((value, index) => {
                    return value !== "";
                });

                //add operation to tot
                for (let i = 3; i < arr.length; i++) {
                    let y = 0;
                    if (symbols[y] === "+" && arr[i]) {
                        tot += (+arr[i]);
                        string += " + " + arr[i];
                    } else if (symbols[y] === "-" && arr[i]) {
                        tot -= (+arr[i]);
                        string += " + " + arr[i];
                    } else if (symbols[y] === "*" && arr[i]) {
                        tot *= (+arr[i]);
                        string += " + " + arr[i];
                    } else if (symbols[y] === "/" && arr[i]) {
                        tot /= (+arr[i]);
                        string += " + " + arr[i];
                    }

                    y++;
                }
                await this.client.sendMessage(
                    this.chat.id._serialized,
                    `@${this.contact.id.user} E' uscito: *${tot}*.
			_${string}_`,
                    { mentions: [this.contact] }
                );
            }
            return true;
        }
        return false;
    }

    private async bambina() {
        if (this.checkCommand('bambina')) {
            const media = await MessageMedia.fromUrl("https://media4.giphy.com/media/oe33xf3B50fsc/giphy.gif");
            await this.chat.sendMessage("PALLA DI FUOCO!");
            setTimeout(() => this.chat.sendMessage(media), 500);
        }
    }

    private async porcodio() {
        if (this.checkCommand('porcodio') || this.checkCommand('dioporco')) {
            const media = await MessageMedia.fromUrl("https://memegenerator.net/img/instances/65928016/porco-dio.jpg");
            this.chat.sendMessage(media);
        }
    }

    private async madonna() {
        if (this.checkCommand('porca')) {
            const media = await MessageMedia.fromUrl("https://c.tenor.com/h907jM3DRrUAAAPo/santi-saints.mp4");
            this.chat.sendMessage(media);
        }
    }
    private async branna() {
        //BRANNA
        if (this.checkCommand('branna')) {
            this.chat.sendMessage("Menomale che salvare i morenti è un trucchetto");
        }
    }

    private async fortune() {
        let command = 'fortune'
        let prompt = this.getArgsFromCommand(command);


        if (this.checkCommand(command)) {
            let dice = 10
            // if (!isNaN(+prompt)) {
            //     dice = +prompt;
            // }

            this.chat.sendMessage("Ok, vediamo quanta fortuna hai oggi!")

            let launches: number[] = []

            await new Promise(async (resolve) => {
                for (let i = 0; i < dice; i++) {
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            let launch = _.random(1, 20, false)
                            launches.push(launch);
                            resolve(this.chat.sendMessage("dal d20 è uscito: " + launch + "Moltiplicatore x" + (launch === 20 ? "1.5" : launch === 1 ? "0.5" : launch > 15 ? "1.04" : "1")))
                        }, 500)
                    })
                }
                resolve(true)
            })
            let multiplierFactor = 1;
            let fortuneCalc = launches.reduce((acc, curr) => {
                if (curr === 20) {
                    multiplierFactor *= 1.5
                    return acc + curr
                } else if (curr === 1) {
                    multiplierFactor *= 0.5
                    return acc - 20
                } else {

                    if (curr > 15) {
                        multiplierFactor *= 1.04
                        return acc + curr
                    }
                    else {
                        return acc + (curr / 2)
                    }
                }
            }
                , 0)

            let fortune = fortuneCalc * multiplierFactor

            this.chat.sendMessage('Hai accumulato un moltiplicatore di: ' + multiplierFactor.toFixed(2) + '. Il tuo fattore fortuna è  ' + fortune.toFixed(2) + '/' + ' (' + (fortune / (dice * 20) * 100).toFixed(2) + '%)')
        }
    }

    private async monaco() {
        if (this.checkCommand('monaco')) {
            this.chat.sendMessage("*Attacco con la Quarterstaff*").then(async () => {
                this.monacoReit(10);
            });
        }
    }
    private async monacoReit(fortune: number) {
        let dado = -1;
        console.log("ciao");
        setTimeout(async () => {
            this.chat.sendMessage("*Tiro un d20!*").then(() => {
                setTimeout(async () => {
                    dado = Math.floor(Math.random() * 20 + 1);

                    if (dado < 15) {
                        this.chat.sendMessage(`_È uscito: *${dado}*, l'hai mancato_`).then(() => {
                            setTimeout(async () => {
                                this.chat.sendMessage("*Oh cazzo; uso un punto ki per attaccare*").then(() => {
                                    fortune -= 1;
                                    this.monacoReit(fortune);
                                });
                            }, 500);
                        });
                    } else
                        this.chat.sendMessage(`_È uscito:_ ${dado}, l'hai preso! _`).then(() => {
                            console.log(fortune);
                            this.chat.sendMessage(`*EVVIVA! HO FATTO ${fortune} DANNI!*`);
                        });
                }, 500);
            });
        }, 1000);
    }

    private checkCommand(desiredCommand: string): boolean {
        return this.message.body.trim() === MinchiateService.COMMAND_IDENTIFIER + desiredCommand;
    }

    private getArgsFromCommand(desiredCommand: string): string {
        return this.message.body.replace(MinchiateService.COMMAND_IDENTIFIER + desiredCommand, "").trim();
    }
}