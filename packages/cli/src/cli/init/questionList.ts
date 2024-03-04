import inquirer from 'inquirer'
import { regionList } from './regionList'
import chalk from 'chalk'
import { Logger } from '@/lib/logger'
import { SkeetTemplateBackend } from '@/types/skeetTypes'

export module questionList {
  export const requireRepoName = (value: string) => {
    if (/.+\/.+/.test(value)) {
      return true
    }

    return 'This is not GitHub Repo Name!It must be repoOwner/repoName'
  }

  export const requireLetterAndNumber = (value: string) => {
    if (/\w/.test(value) && /\d/.test(value)) {
      return true
    }

    return 'Password need to have at least a letter and a number'
  }

  export const projectQuestions = [
    {
      type: 'input',
      name: 'projectId',
      message: "What's your GCP Project ID",
      default() {
        return 'skeet-app-123456'
      },
    },
    {
      type: 'input',
      name: 'fbProjectId',
      message: "What's your Firebase Project ID",
      default() {
        return 'skeet-app-123456'
      },
    },
    {
      type: 'list',
      message: 'Select Regions to deploy',
      name: 'region',
      choices: [
        new inquirer.Separator(' 🌏 Regions 🌏 '),
        ...regionList.map((value) => ({ name: value })),
      ],
      validate(answer: string) {
        if (answer.length < 1) {
          return 'You must choose at least one service.'
        }

        return true
      },
    },
  ]

  export const projectRegionQuestions = [
    {
      type: 'input',
      name: 'projectId',
      message: "What's your GCP Project ID",
      default() {
        return 'skeet-app-123456'
      },
    },
    {
      type: 'list',
      message: 'Select Regions to deploy',
      name: 'region',
      choices: [
        new inquirer.Separator(' 🌏 Regions 🌏 '),
        ...regionList.map((value) => ({ name: value })),
      ],
      validate(answer: string) {
        if (answer.length < 1) {
          return 'You must choose at least one service.'
        }

        return true
      },
    },
  ]

  export const backendTemplateQuestions = [
    {
      type: 'list',
      message: 'Select Template of Skeet',
      name: 'template',
      choices: [
        new inquirer.Separator(' Templates '),
        { name: SkeetTemplateBackend.GraphQL },
        { name: SkeetTemplateBackend.Firestore },
      ],
      validate(answer: string) {
        if (answer.length < 1) {
          return 'You must choose at least one template.'
        }
        return true
      },
    },
  ]

  export const needDomainQuestions = [
    {
      type: 'list',
      message: 'Do you want to setup your domain?',
      name: 'isNeedDomain',
      choices: [
        new inquirer.Separator(chalk.white()),
        ...['yes(needs your domain)', 'no'],
      ],
    },
  ]

  export const githubRepoQuestions = [
    {
      type: 'input',
      name: 'githubRepo',
      message: "What's your GitHub Repo Name",
      validate: questionList.requireRepoName,
      default() {
        return 'elsoul/skeet-app'
      },
    },
  ]

  export const sqlPasswordQuestions = [
    {
      type: 'password',
      message: 'Enter your CloudSQL password',
      name: 'password1',
      mask: '*',
      validate: requireLetterAndNumber,
    },
    {
      type: 'password',
      message: 'Confirm your password',
      name: 'password2',
      mask: '*',
      validate: requireLetterAndNumber,
    },
  ]

  export const checkIfFirebaseSetup = async (projectId: string) => {
    try {
      const firebaseSettingsCheck = inquirer.prompt([
        {
          type: 'list',
          message: 'Are you sure if you already set them up?',
          name: 'firebase',
          choices: [new inquirer.Separator(chalk.white()), ...['yes', 'no']],
        },
      ])
      await firebaseSettingsCheck.then(async (answers) => {
        if (answers.firebase === 'no') {
          Logger.error(
            'Please setup Firestore before running this command. \nhttps://console.firebase.google.com/project/${projectId}/firestore',
          )
          throw new Error('Firestore is not setup')
        }
      })
    } catch (error) {
      throw new Error(`checkIfFirebaseSetup: ${error}`)
    }
  }
}
