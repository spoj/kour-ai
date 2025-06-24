import { rollDice, rollDiceTool } from "./rollDice";
import { checkOnline, checkOnlineTool } from "./checkOnline";

export const tools = [rollDiceTool, checkOnlineTool];

export const toolExecutor: { [key: string]: (args: any) => any } = {
  rollDice,
  checkOnline,
};
