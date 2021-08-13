import { ShuffleBot } from "./shuffleBot";

class Main
{
    private shuffleBot: ShuffleBot|null = null;
    private applicationIsRunning = false;

    constructor ()
    {
        const terminateFunction = (): void => this.terminate();

        process.on('exit', terminateFunction);
        process.on('SIGINT', terminateFunction); // Ctrl + C
        process.on('SIGHUP', terminateFunction); // Terminal closed
        process.on('SIGTERM', terminateFunction); // "kill pid" / "killall"
        process.on('SIGUSR1', terminateFunction); // "kill -SIGUSR1 pid" / "killall -SIGUSR1"
        process.on('SIGUSR2', terminateFunction); // "kill -SIGUSR2 pid" / "killall -SIGUSR2"
    }

    /**
     * Terminate all running connections and report about the closing programme.
     */
    public terminate (): void
    {
        if (this.applicationIsRunning)
        {
            console.log("Shuffle Bot is closing...");

            this.applicationIsRunning = false;

            if (this.shuffleBot !== null)
            {
                this.shuffleBot.terminate();
            }

            console.log("Shuffle Bot closed.");
        }
    }

    public async run (): Promise<void>
    {
        console.log('Shuffle Bot is starting...');

        this.applicationIsRunning = true;

        this.shuffleBot = new ShuffleBot();

        const loginName = await this.shuffleBot.run();

        console.log(`Shuffle Bot started. Logged in as ${loginName}.`);
    }
}

const main = new Main();
void main.run();
