import { execSyncCmd } from '@/lib/execSyncCmd'
import { getFunctionInfo, getNetworkConfig } from '@/lib/getSkeetConfig'

export const updateBackend = async (
  projectId: string,
  appName: string,
  methodName: string
) => {
  const functionInfo = await getFunctionInfo(methodName)
  const skeetConfig = await getNetworkConfig(projectId, appName)
  const shCmd = [
    'gcloud',
    'compute',
    'backend-services',
    'update',
    functionInfo.backendService,
    '--security-policy',
    skeetConfig.securityPolicyName,
    '--global',
    '--project',
    projectId,
  ]
  await execSyncCmd(shCmd)
}
