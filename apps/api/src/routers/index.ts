/**
 * App Router
 *
 * Composed router with all domain routers.
 * Split into separate files to avoid TypeScript TS7056 limits.
 */

import { healthRouter } from "./health";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { notesRouter } from "./notes";
import { ticketsRouter } from "./tickets";
import { dashboardRouter } from "./dashboard";
import { kbRouter } from "./kb";
import { filesRouter } from "./files";

import { registersRouter } from './registers'
import { crossRegisterRouter } from './cross-register'
import { dataTransferRouter } from './data-transfer'
import { autoPopulateRouter } from './auto-populate'

export const appRouter = {
  health: healthRouter,
  user: userRouter,
  billing: billingRouter,
  notes: notesRouter,
  tickets: ticketsRouter,
  dashboard: dashboardRouter,
  kb: kbRouter,
  files: filesRouter,
  registers: registersRouter,
  crossRegister: crossRegisterRouter,
  dataTransfer: dataTransferRouter,
  autoPopulate: autoPopulateRouter,
  // Add more routers here as needed:
  // org: orgRouter,
  // asset: assetRouter,
};

export type AppRouter = typeof appRouter;
