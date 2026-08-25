/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'admin.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.index']['types'],
  },
  'admin.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/admin/dashboard',
    tokens: [{"old":"/admin/dashboard","type":0,"val":"admin","end":""},{"old":"/admin/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['admin.dashboard']['types'],
  },
  'admin.events.results.store': {
    methods: ["POST"],
    pattern: '/admin/events/:id/results',
    tokens: [{"old":"/admin/events/:id/results","type":0,"val":"admin","end":""},{"old":"/admin/events/:id/results","type":0,"val":"events","end":""},{"old":"/admin/events/:id/results","type":1,"val":"id","end":""},{"old":"/admin/events/:id/results","type":0,"val":"results","end":""}],
    types: placeholder as Registry['admin.events.results.store']['types'],
  },
  'admin.athletes.store': {
    methods: ["POST"],
    pattern: '/admin/athletes',
    tokens: [{"old":"/admin/athletes","type":0,"val":"admin","end":""},{"old":"/admin/athletes","type":0,"val":"athletes","end":""}],
    types: placeholder as Registry['admin.athletes.store']['types'],
  },
  'admin.athletes.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/athletes/:id',
    tokens: [{"old":"/admin/athletes/:id","type":0,"val":"admin","end":""},{"old":"/admin/athletes/:id","type":0,"val":"athletes","end":""},{"old":"/admin/athletes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.athletes.destroy']['types'],
  },
  'admin.athletes.clearAll': {
    methods: ["POST"],
    pattern: '/admin/athletes/clear-all',
    tokens: [{"old":"/admin/athletes/clear-all","type":0,"val":"admin","end":""},{"old":"/admin/athletes/clear-all","type":0,"val":"athletes","end":""},{"old":"/admin/athletes/clear-all","type":0,"val":"clear-all","end":""}],
    types: placeholder as Registry['admin.athletes.clearAll']['types'],
  },
  'admin.athletes.sync': {
    methods: ["POST"],
    pattern: '/admin/athletes/sync-excel',
    tokens: [{"old":"/admin/athletes/sync-excel","type":0,"val":"admin","end":""},{"old":"/admin/athletes/sync-excel","type":0,"val":"athletes","end":""},{"old":"/admin/athletes/sync-excel","type":0,"val":"sync-excel","end":""}],
    types: placeholder as Registry['admin.athletes.sync']['types'],
  },
  'admin.athletes.upload': {
    methods: ["POST"],
    pattern: '/admin/athletes/upload-excel',
    tokens: [{"old":"/admin/athletes/upload-excel","type":0,"val":"admin","end":""},{"old":"/admin/athletes/upload-excel","type":0,"val":"athletes","end":""},{"old":"/admin/athletes/upload-excel","type":0,"val":"upload-excel","end":""}],
    types: placeholder as Registry['admin.athletes.upload']['types'],
  },
  'urusetia.login': {
    methods: ["GET","HEAD"],
    pattern: '/urusetia-2026',
    tokens: [{"old":"/urusetia-2026","type":0,"val":"urusetia-2026","end":""}],
    types: placeholder as Registry['urusetia.login']['types'],
  },
  'urusetia.short': {
    methods: ["GET","HEAD"],
    pattern: '/urusetia',
    tokens: [{"old":"/urusetia","type":0,"val":"urusetia","end":""}],
    types: placeholder as Registry['urusetia.short']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
