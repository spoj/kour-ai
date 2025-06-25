import fs from "fs";
import path from "path";
import { ChatCompletionTool } from "openai/resources/chat/completions";

export async function checkDirectory({
  rootDir,
  directoryPath = "",
}: {
  directoryPath?: string;
  rootDir: string;
}) {
  if (!rootDir) {
    throw new Error("Root directory is not specified.");
  }

  const dir = path.resolve(rootDir, directoryPath);

  // Security check to ensure the path is within the root directory
  const relative = path.relative(rootDir, dir);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(
      "Access to paths outside the root directory is not allowed."
    );
  }

  const items = fs
    .readdirSync(dir)
    .map((item) => {
      const itemPath = path.join(dir, item);
      return fs.statSync(itemPath).isDirectory() ? `${item}/` : item;
    })
    .sort();

  return items.join("\n");
}

export const checkDirectoryTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "checkDirectory",
    description:
      "List files and directories in the specified path relative to root directory.",
    parameters: {
      type: "object",
      properties: {
        directoryPath: {
          type: "string",
          description:
            "The path to list files and directories in. Defaults to the root directory.",
        },
      },
    },
  },
};
