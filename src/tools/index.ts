import { rollDice, rollDiceTool } from "./rollDice";
import { checkOnline, checkOnlineTool } from "./checkOnline";
import { checkDirectory, checkDirectoryTool } from "./checkDirectory";

export const tools = [rollDiceTool, checkOnlineTool, checkDirectoryTool];

export const toolExecutor: { [key: string]: (args: any) => any } = {
  rollDice,
  checkOnline,
  checkDirectory,
};
