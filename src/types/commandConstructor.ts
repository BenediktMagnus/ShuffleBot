import { Command } from "../commands/command";
import { Engine } from "../engine";

export type CommandConstructor = new (commandHandler: Engine) => Command;
