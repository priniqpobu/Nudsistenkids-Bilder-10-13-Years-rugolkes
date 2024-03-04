import {
  Logger,
  importConfig,
  firebaseUseAdd,
  firebaseLogin,
  createLoadBalancer,
  isSQLexists,
  setupCloud,
  createServiceAccount,
  setupNetwork,
  getZone,
  runAddAllRole,
  runEnableAllPermission,
} from '@/lib'
import { addFirebaseApp } from '../sub/add/addFirebaseApp'
import { pnpmBuild } from '../../lib/pnpmBuild'
import { firebaseFunctionsDeploy } from '../deploy/firebaseDeploy'
import { deployRules } from '../deploy/deployRules'
import { setupSQL } from '@/lib/setup/setupSQL'
import {
  DomainAnswer,
  askForGithubRepo,
  askForSqlPassword,
} from './askQuestions'
import { addProjectRegionToSkeetOptions } from '@/lib/files/addJson'
import { genGithubActions } from '../gen'
import { projectIdNotExists } from '@/lib/gcloud/billing/checkBillingAccount'
import { DEFAULT_FUNCTION_NAME, FIREBASERC_PATH } from '@/index'
import { syncRoutings } from '../sub/sync/syncRoutings'
import inquirer from 'inquirer'
import { questionList } from './questionList'
import { spawnSync } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { domains } from './initLb'

export type initialParams = {
  projectId: string
  fbProjectId: string
  region: string
}

export const init = async (loginMode = false) => {
  // Setup Google Cloud Project
  const { projectId, fbProjectId, region } =
    await inquirer.prompt<initialParams>(questionList.projectQuestions)
  if (await projectIdNotExists(projectId))
    Logger.projectIdNotExistsError(projectId)

  await updateFirebaserc(fbProjectId)

  if (!region) throw new Error('region is undefined')

  // Setup Firebase Project
  await firebaseLogin()
  await firebaseUseAdd(fbProjectId)
  await addProjectRegionToSkeetOptions(
    region,
    projectId,
    fbProjectId,
    DEFAULT_FUNCTION_NAME,
  )
  const defaultAppDisplayName = fbProjectId
  await addFirebaseApp(fbProjectId, defaultAppDisplayName)
  const { app } = await importConfig()
  await createServiceAccount(projectId, app.name)
  await runEnableAllPermission(projectId)
  await runAddAllRole(projectId, app.name)
  if (loginMode) return

  const skeetConfig = await importConfig()
  await Logger.confirmFirebaseSetup(fbProjectId, skeetConfig.app.template)

  const githubRepo = await askForGithubRepo()

  let domainAnswer: DomainAnswer = {
    isDomain: false,
    appDomain: '',
    nsDomain: '',
    lbDomain: '',
  }

  let sqlPassword = ''
  const hasGraphQL = skeetConfig.app.template.includes('GraphQL')

  if (hasGraphQL && !(await isSQLexists())) {
    sqlPassword = await askForSqlPassword()
  }

  // Ask Domain info if LB is not exists
  if (!skeetConfig.app.hasLoadBalancer) {
    domainAnswer = await inquirer.prompt<DomainAnswer>(domains)
  }

  // Setup Cloud
  await setupCloud(skeetConfig, githubRepo, skeetConfig.app.region)

  // Setup Network
  await setupNetwork()

  // Setup Cloud SQL
  if (sqlPassword !== '') await setupSQL(skeetConfig, sqlPassword)

  // Deploy Default Firebase Functions
  pnpmBuild(DEFAULT_FUNCTION_NAME)
  await firebaseFunctionsDeploy(skeetConfig.app.fbProjectId)
  await deployRules(skeetConfig.app.fbProjectId)

  // Create Github Actions
  await genGithubActions()

  // Create Load Balancer if not exists
  if (!skeetConfig.app.hasLoadBalancer) {
    await createLoadBalancer(skeetConfig, domainAnswer)
    await syncRoutings()
    const cmd = `pnpm deploy`
    spawnSync(cmd, { stdio: 'inherit', shell: true })
    const ips = await getZone(projectId, skeetConfig.app.name)
    Logger.dnsSetupLog(ips)
  } else {
    const cmd = `pnpm deploy`
    spawnSync(cmd, { stdio: 'inherit', shell: true })
  }
}

const updateFirebaserc = async (fbProjectId: string) => {
  const firebaserc = JSON.parse(await readFile(FIREBASERC_PATH, 'utf-8'))
  firebaserc.projects.default = fbProjectId
  await writeFile(FIREBASERC_PATH, JSON.stringify(firebaserc, null, 2))
}
