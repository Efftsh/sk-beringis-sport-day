/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')
const DashboardController = () => import('#controllers/admin/dashboard_controller')
const ScoresController = () => import('#controllers/admin/scores_controller')
const AthletesController = () => import('#controllers/admin/athletes_controller')

router.get('/', [HomeController, 'index']).as('home')


router
  .group(() => {
    router.get('/admin', [DashboardController, 'index']).as('admin.index')
    router.get('/admin/dashboard', [DashboardController, 'index']).as('admin.dashboard')

    // Live Event Results Recording
    router.post('/admin/events/:id/results', [ScoresController, 'store']).as('admin.events.results.store')

    // Live Athlete Roster Management
    router.post('/admin/athletes', [AthletesController, 'store']).as('admin.athletes.store')
    router.delete('/admin/athletes/:id', [AthletesController, 'destroy']).as('admin.athletes.destroy')
    router.post('/admin/athletes/clear-all', [AthletesController, 'clearAll']).as('admin.athletes.clearAll')
    router.post('/admin/athletes/sync-excel', [AthletesController, 'syncExcel']).as('admin.athletes.sync')
    router.post('/admin/athletes/upload-excel', [AthletesController, 'uploadExcel']).as('admin.athletes.upload')
  })
  .use(middleware.auth())

router
  .group(() => {
    // Secret Admin Gateways & Standard Login
    router.get('urusetia-2026', [controllers.Session, 'create']).as('urusetia.login')
    router.get('urusetia', [controllers.Session, 'create']).as('urusetia.short')
    router.get('login', [controllers.Session, 'create']).as('session.create')
    router.post('login', [controllers.Session, 'store']).as('session.store')

  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')
  })
  .use(middleware.auth())


