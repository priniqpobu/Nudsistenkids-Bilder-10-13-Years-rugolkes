import Dotenv from 'dotenv'
import { Command } from 'commander'
import fs from 'fs'
import { VERSION } from '@/lib/version'
import {
  YarnCmd,
  addJsonEnv,
  server,
  create,
  createServiceAccountKey,
  deploy,
  init,
  setupIam,
  yarn,
  listFunctions,
  syncRoutings,
  syncModels,
  syncTypes,
  syncArmor,
  addFunctions,
} from '@/cli'
import { Logger } from '@/lib/logger'
import { skeetCloudConfigAppGen } from '@/templates/init/skeet-cloud.config-app'
import { deleteRoutings } from './cli/delete'

export type SkeetCloudConfig = {
  app: AppConfig
  functions: FunctionConfig[]
  cloudArmor?: CloudArmor
}

export type AppConfig = {
  name: string
  projectId: string
  region: string
  appDomain: string
  functionsDomain: string
}

export type FunctionConfig = {
  name: string
  methods: FunctionMethods[]
}

export type FunctionMethods = {
  name: string
  url: string
  pubsub: boolean
  scheduler: string
}

export type CloudArmor = Array<SecurityPolicy>

export type SecurityPolicy = {
  securityPolicyName: string
  rules: [
    {
      priority: string
      description: string
      options: { [key: string]: string }
    }
  ]
}

export const importConfig = async () => {
  try {
    const config = fs.readFileSync(`${process.cwd()}/skeet-cloud.config.json`)
    const json: SkeetCloudConfig = JSON.parse(String(config))
    return json
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export const importFirebaseConfig = async () => {
  try {
    const config = fs.readFileSync(`${process.cwd()}/firebase.json`)
    const json = JSON.parse(String(config))
    return json
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

const program = new Command()

program
  .name('skeet')
  .description('CLI for Skeet - Full-stack TypeScript Serverless framework')
  .version(VERSION)

Dotenv.config()

async function main() {
  // Please check the descriptions if they are correct.
  try {
    program
      .command('create')
      .argument('<appName>', 'Name of the app')
      .description('Create Skeet App')
      .action(async (appName: string) => {
        await create(appName)
      })
    program
      .command('server')
      .description('Run Skeet Server')
      .alias('s')
      .action(server)
    program
      .command('deploy')
      .description('Deploy Skeet APP to Google Cloud Platform')
      .action(deploy)
    program
      .command('init')
      .option('--only-config', 'Generate Skeet Cloud Config', false)
      .option('--skip-setup-cloud', 'Generate Skeet Cloud Config', false)
      .description('Generate Skeet Cloud Config')
      .action(async (options) => {
        if (options.onlyConfig) {
          const data = await skeetCloudConfigAppGen()
          fs.writeFileSync(data.filePath, data.body)
        } else {
          await init(options.skipSetupCloud)
        }
      })

    const iam = program.command('iam').description('Skeet IAM Comannd')
    iam
      .command('init')
      .description('Setup IAM for Google Cloud Platform')
      .action(async () => {
        await setupIam()
      })
    iam
      .command('pull')
      .description('Download IAM Key for Google Cloud Platform')
      .action(async () => {
        const config = await importConfig()
        await createServiceAccountKey(config.app.projectId, config.app.name)
      })
    iam
      .command('sync')
      .description('Sync Service Account Key as GitHub Secret')
      .action(async () => {
        await addJsonEnv()
      })
    program
      .command('yarn')
      .argument(
        '<yarnCmd>',
        Object.entries(YarnCmd)
          .map(([_, value]) => value)
          .join(',')
      )
      .option('-p, --p <packageName>', 'npm package name', '')
      .option('-D', 'Dependency environment', false)
      .action(async (yarnCmd: string, options) => {
        if (yarnCmd === 'add' && options.p === '') {
          await Logger.error('You need to define package name!')
          process.exit(1)
        }
        await yarn(yarnCmd, options.p, options.D)
      })
    const add = program.command('add').description('Add Comannd')
    add
      .command('functions')
      .argument('<functionsName>', 'Functions Name - e.g. openai')
      .action(async (functionsName: string) => {
        await addFunctions(functionsName)
      })

    const sync = program.command('sync').description('Skeet Sync Comannd')
    sync
      .command('models')
      .description('Skeet Sync Models')
      .action(async () => {
        await syncModels()
      })
    sync
      .command('types')
      .description('Skeet Sync Types')
      .action(async () => {
        await syncTypes()
      })
    sync
      .command('routings')
      .description('Skeet Sync Routings')
      .action(async () => {
        await syncRoutings()
      })
    sync
      .command('armor')
      .description('Skeet Sync Cloud Armor Rules')
      .action(async () => {
        await syncArmor()
      })

    const d = program
      .command('delete')
      .alias('d')
      .description('Skeet Delete Command')
    d.command('routings')
      .argument('<methodName>', 'Functions Name - e.g. openai')
      .description('Delete Routings')
      .action(async (methodName: string) => {
        await deleteRoutings(methodName)
      })

    const list = program.command('list').description('Show Skeet App List')
    list
      .command('functions')
      .description('Show Skeet Functions List')
      .action(async () => {
        await listFunctions()
      })

    await program.parseAsync(process.argv)
  } catch (error) {
    console.log(error)
  }
}

main()
