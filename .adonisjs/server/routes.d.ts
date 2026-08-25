import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.events.results.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.athletes.store': { paramsTuple?: []; params?: {} }
    'admin.athletes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.athletes.clearAll': { paramsTuple?: []; params?: {} }
    'admin.athletes.sync': { paramsTuple?: []; params?: {} }
    'admin.athletes.upload': { paramsTuple?: []; params?: {} }
    'urusetia.login': { paramsTuple?: []; params?: {} }
    'urusetia.short': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'urusetia.login': { paramsTuple?: []; params?: {} }
    'urusetia.short': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'urusetia.login': { paramsTuple?: []; params?: {} }
    'urusetia.short': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'admin.events.results.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.athletes.store': { paramsTuple?: []; params?: {} }
    'admin.athletes.clearAll': { paramsTuple?: []; params?: {} }
    'admin.athletes.sync': { paramsTuple?: []; params?: {} }
    'admin.athletes.upload': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'admin.athletes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}