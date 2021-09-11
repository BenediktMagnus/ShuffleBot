import { Config } from "./config";

/**
 * The engine of the bot contains the main logic and handles the commands.
 */
export class Engine
{
    private config: Config;

    constructor (config: Config)
    {
        this.config = config;
    }
}
