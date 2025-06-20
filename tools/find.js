import { glob } from "glob";
import path from "path";

const MAX_RESULTS = 1000;

export async function find(args, toolContext) {
  const { rootDir } = toolContext;
  if (!rootDir) {
    return "Error: Root directory is not specified. Please specify a root directory.";
  }
  const options = {
    cwd: rootDir,
    nodir: true,
  };
  const files = await glob(args.glob_pattern, options);
  if (files.length > MAX_RESULTS) {
    return "Error: Too many files found. Please use `ls` or `find` with more specific patterns iteratively.";
  }
  return {
    showing: files.length,
    total: files.length,
    files: files.sort(),
  };
}


export const find_tool = {
  type: "function",
  function: {
    name: "find",
    description: "Find files matching a glob pattern.",
    parameters: {
      type: "object",
      properties: {
        glob_pattern: {
          type: "string",
          description: "The glob pattern to search for.",
        },
      },
      required: ["glob_pattern"],
    },
  },
};
