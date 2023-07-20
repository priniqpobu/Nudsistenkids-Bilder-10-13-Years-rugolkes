import { SkeetCloudConfig } from '@/types/skeetTypes'
import { deployCloudRun } from './deployCloudRun'
import { buildContainer } from './buildContainer'
import { tagContainer } from './tagContainer'
import { pushContainer } from './pushContainer'

export const deployGraphql = async (skeetConfig: SkeetCloudConfig) => {
  await buildContainer(skeetConfig.app.name)
  await tagContainer(
    skeetConfig.app.projectId,
    skeetConfig.app.name,
    skeetConfig.app.region
  )
  await pushContainer(
    skeetConfig.app.projectId,
    skeetConfig.app.name,
    skeetConfig.app.region
  )
  await deployCloudRun(
    skeetConfig.app.projectId,
    skeetConfig.app.name,
    skeetConfig.app.region,
    skeetConfig.cloudRun.memory,
    String(skeetConfig.cloudRun.cpu),
    String(skeetConfig.cloudRun.maxConcurrency),
    String(skeetConfig.cloudRun.maxInstances),
    String(skeetConfig.cloudRun.minInstances),
    '',
    false,
    skeetConfig.app.hasLoadBalancer
  )
}
