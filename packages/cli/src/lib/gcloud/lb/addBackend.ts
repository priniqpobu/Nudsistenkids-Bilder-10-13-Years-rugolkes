import { execAsyncCmd } from '@/lib/execAsyncCmd'
import { getFunctionInfo, getNetworkConfig } from '@/lib'

export const addBackend = async (
  projectId: string,
  appName: string,
  methodName: string,
  region: string,
  init = false,
) => {
  const appConf = getNetworkConfig(projectId, appName)
  const functionInfo = getFunctionInfo(methodName)
  const backendName = init
    ? appConf.defaultBackendServiceName
    : functionInfo.backendService
  const shCmd = [
    'gcloud',
    'compute',
    'backend-services',
    'add-backend',
    backendName,
    '--network-endpoint-group',
    functionInfo.neg,
    '--network-endpoint-group-region',
    region,
    '--global',
    '--project',
    projectId,
  ]
  await execAsyncCmd(shCmd)
}
