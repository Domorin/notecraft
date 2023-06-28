import { prisma } from "../prisma";
import { procedure } from "../trpc";

export const testProcedure = procedure.query(async (opts) => {
  return "hello";
});
