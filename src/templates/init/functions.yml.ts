import fs from 'fs'

export const functionsYml = async (functionName: string) => {
  fs.mkdirSync('.github/workflows', { recursive: true })
  const nodeVersion = '18.14.2'
  const name = functionName.toLocaleUpperCase()
  const ymlName = `functions-${functionName}.yml`
  const filePath = `.github/workflows/${ymlName}`
  const body = `name: ${name}
on:
  push:
    branches:
      - main
    paths:
      - 'functions/${functionName}/**'
      - '.github/workflows/${ymlName}'

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v2
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '${nodeVersion}'
      - id: auth
          uses: google-github-actions/auth@v0
          with:
            credentials_json: \${{ secrets.SKEET_GCP_SA_KEY }}
      - name: Install yarn and firebase tools
        run: npm i -g npm yarn firebase-tools
      - name: GitHub repository setting
        run: git config --global url."https://github.com".insteadOf ssh://git@github.com
      - name: Install dependencies
        run: cd ./functions/${functionName} && yarn install --frozen-lockfile
      - name: Build App
        run: cd ./functions/${functionName} && yarn build
      - name: Deploy to Firebase
        run: firebase deploy --only functions
`
  return {
    filePath,
    body,
  }
}
