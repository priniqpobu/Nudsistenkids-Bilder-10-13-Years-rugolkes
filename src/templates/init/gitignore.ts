export const gitignore = async (appName: string) => {
  const filePath = `${appName}/.gitignore`
  const body = `
# Compiled JavaScript files
lib/**/*.js
lib/**/*.js.map

# TypeScript v1 declaration files
typings/

# Node.js dependency directory
node_modules/
keyfile.json
.env
functions/**/.env
functions/**/*.log
*.log
**/*.log

# OSX
#
.DS_Store

# Xcode
#
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
project.xcworkspace

# Android/IntelliJ
#
build/
.idea
.gradle
local.properties
*.iml
*.hprof

# node.js
#
node_modules/
npm-debug.log
yarn-error.log

# BUCK
buck-out/
\.buckd/
*.keystore

# fastlane
#
# It is recommended to not store the screenshots in the git repo. Instead, use fastlane to re-generate the
# screenshots whenever they are needed.
# For more information about the recommended setup visit:
# https://docs.fastlane.tools/best-practices/source-control/

*/fastlane/report.xml
*/fastlane/Preview.html
*/fastlane/screenshots

# Bundle artifacts
*.jsbundle

# CocoaPods
/ios/Pods/

# Expo
.expo/
web-build/

# Temporary files created by Metro to check the health of the file watcher
.metro-health-check*


# local env files
.env*.local

# Gcloud key
gcloud-key.json

# env
.env

#firebase
.firebase
firebase-debug.log
  `
  return {
    filePath,
    body,
  }
}
