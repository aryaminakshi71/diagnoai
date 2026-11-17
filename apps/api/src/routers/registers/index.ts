/**
 * Register Routers Index
 * 
 * Composes all register routers
 */

export * from './entry'
export * from './opd'
export * from './stock'
export * from './biochemistry'
export * from './brucella-rbpt'
export * from './brucella-sero'
export * from './fmd'
export * from './bird-flu'
export * from './abst'
export * from './daily-expenditure'
export * from './psks-cashbook'
export * from './psks-entry'
export * from './ledger'
export * from './dispatch'
export * from './psks-ledger'
export * from './psks-stock'
export * from './import'

// Composed register router
import { entryRegisterRouter } from './entry'
import { opdRegisterRouter } from './opd'
import { stockRegisterRouter } from './stock'
import { biochemistryRegisterRouter } from './biochemistry'
import { brucellaRbptRegisterRouter } from './brucella-rbpt'
import { brucellaSeroRegisterRouter } from './brucella-sero'
import { fmdRegisterRouter } from './fmd'
import { birdFluRegisterRouter } from './bird-flu'
import { abstRegisterRouter } from './abst'
import { dailyExpenditureRegisterRouter } from './daily-expenditure'
import { psksCashbookRegisterRouter } from './psks-cashbook'
import { psksEntryRegisterRouter } from './psks-entry'
import { ledgerRegisterRouter } from './ledger'
import { dispatchRegisterRouter } from './dispatch'
import { psksLedgerRegisterRouter } from './psks-ledger'
import { psksStockRegisterRouter } from './psks-stock'
import { registerImportRouter } from './import'

export const registersRouter = {
  entry: entryRegisterRouter,
  opd: opdRegisterRouter,
  stock: stockRegisterRouter,
  biochemistry: biochemistryRegisterRouter,
  brucellaRbpt: brucellaRbptRegisterRouter,
  brucellaSero: brucellaSeroRegisterRouter,
  fmd: fmdRegisterRouter,
  birdFlu: birdFluRegisterRouter,
  abst: abstRegisterRouter,
  dailyExpenditure: dailyExpenditureRegisterRouter,
  psksCashbook: psksCashbookRegisterRouter,
  psksEntry: psksEntryRegisterRouter,
  ledger: ledgerRegisterRouter,
  dispatch: dispatchRegisterRouter,
  psksLedger: psksLedgerRegisterRouter,
  psksStock: psksStockRegisterRouter,
  import: registerImportRouter,
}
