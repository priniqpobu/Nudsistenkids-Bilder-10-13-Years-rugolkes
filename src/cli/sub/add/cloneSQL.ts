import { BACKEND_SQL_REPO_URL, SKEET_CONFIG_PATH, importConfig } from '@/lib'
import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { updateDefaultIndex } from './updateDefaultIndex'
import { addScriptToPackageJson } from '@/lib/files/addScriptToPackageJson'

export const cloneSQL = (sqlName: string) => {
  const config = importConfig()
  const sqlRoot = './sql/' + sqlName
  if (existsSync(sqlRoot)) {
    console.log('SQL already exists')
    return
  }
  mkdirSync(sqlRoot, { recursive: true })
  const gitCloneCmd = ['git', 'clone', BACKEND_SQL_REPO_URL, sqlRoot]
  spawnSync(gitCloneCmd[0], gitCloneCmd.slice(1), { stdio: 'inherit' })
  const dbDevURL = `DATABASE_URL=postgresql://skeeter:rabbit@127.0.0.1:5432/skeet-${sqlName}-dev?schema=public`
  spawnSync(`echo ${dbDevURL} >> ${sqlRoot}/.env`, {
    shell: true,
    stdio: 'inherit',
  })
  spawnSync('yarn', { shell: true, stdio: 'inherit', cwd: sqlRoot })
  const instanceName = 'sql-' + sqlName
  const sqlCmd = instanceName.replace('-db', '')
  updateDefaultIndex(instanceName)
  addScriptToPackageJson(
    './package.json',
    `skeet:${sqlCmd}`,
    'yarn --cwd sql/' + sqlName + ' dev',
  )
  const defaultSQLconfig = {
    instanceName,
    databaseVersion: 'POSTGRES_15',
    cpu: '1GiB',
    memory: '4GiB',
    storageSize: 10,
    whiteList: '',
    isCreated: false,
  }
  config.SQLs.push(defaultSQLconfig)
  writeFileSync(SKEET_CONFIG_PATH, JSON.stringify(config, null, 2))
}