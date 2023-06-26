import { prisma } from "../prisma";
import { procedure } from "../trpc";

export const testProcedure = procedure.query(async (opts) => {
  return (await prisma.user.findMany()).map((val) => val.name).join(", ");
});
