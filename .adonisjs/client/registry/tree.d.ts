/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  admin: {
    index: typeof routes['admin.index']
    dashboard: typeof routes['admin.dashboard']
    events: {
      results: {
        store: typeof routes['admin.events.results.store']
      }
    }
    athletes: {
      store: typeof routes['admin.athletes.store']
      destroy: typeof routes['admin.athletes.destroy']
      clearAll: typeof routes['admin.athletes.clearAll']
      sync: typeof routes['admin.athletes.sync']
      upload: typeof routes['admin.athletes.upload']
    }
  }
  urusetia: {
    login: typeof routes['urusetia.login']
    short: typeof routes['urusetia.short']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
}
