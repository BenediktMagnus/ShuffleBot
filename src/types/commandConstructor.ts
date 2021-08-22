import { Command } from "../commands/command";

export type CommandConstructor = new () => Command;
