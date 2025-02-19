import {Command, Flags} from '@oclif/core'
import {promisify} from 'util'
import * as fs from 'fs'
import * as path from 'path'
import AdmZip from 'adm-zip'
import chalk from 'chalk'
import ora from 'ora'
import {exec, spawn} from 'child_process'

const execAsync = promisify(exec)

export default class ReleasePlugin extends Command {
  static description = 'Release plugin to Blinko marketplace'

  static flags = {
    dir: Flags.string({
      char: 'd',
      description: 'Directory containing plugin.json and release folder',
      default: '.',
    }),
  }

  static examples = [
    `$ blinko-cli release plugin
Releasing plugin from current directory...`,
    `$ blinko-cli release plugin --dir ./my-plugin
Releasing plugin from ./my-plugin directory...`,
  ]

  displayError(message: string) {
    console.error(chalk.red(`Error: ${message}`))
    process.exit(1)
  }

  checkRequiredFiles(baseDir: string) {
    const pluginJsonPath = path.join(baseDir, 'plugin.json')
    const releaseDirPath = path.join(baseDir, 'release')

    if (!fs.existsSync(pluginJsonPath)) {
      this.displayError(`plugin.json not found in ${baseDir}`)
    }

    try {
      const pluginData = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'))
      if (!pluginData.version) {
        this.displayError('Missing version field in plugin.json')
      }
    } catch {
      this.displayError('Invalid plugin.json')
    }

    if (!fs.existsSync(releaseDirPath)) {
      this.displayError(`release directory not found in ${baseDir}`)
    }

    const releaseFiles = fs.readdirSync(releaseDirPath)
    if (releaseFiles.length === 0) {
      this.displayError('release directory is empty')
    }
  }

  async openBrowser(url: string) {
    const command = process.platform === 'win32' ? 
      `start ${url}` : 
      process.platform === 'darwin' ? 
        `open ${url}` : 
        `xdg-open ${url}`

    try {
      await execAsync(command)
    } catch (error) {
      this.log(chalk.yellow('🌐 Please visit manually: https://cli.github.com/'))
    }
  }

  async checkAndInstallGitHubCLI() {
    try {
      await execAsync('gh --version')
      this.log(chalk.blue('✓ GitHub CLI is already installed'))
    } catch (error) {
      this.log(chalk.yellow('🔧 Installing GitHub CLI...'))
      try {
        if (process.platform === 'win32') {
          await execAsync('winget install --id GitHub.cli')
        } else if (process.platform === 'darwin') {
          await execAsync('brew install gh')
        } else {
          await execAsync('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh')
        }
        this.log(chalk.green('✅ GitHub CLI installed successfully'))
      } catch (installError) {
        this.error(chalk.red('❌ Failed to install GitHub CLI automatically'))
        this.log(chalk.yellow('🌐 Opening GitHub CLI installation page in browser...'))
        await this.openBrowser('https://cli.github.com/')
        this.exit(1)
      }
    }
  }

  async checkReleaseExists(version: string) {
    try {
      await execAsync(`gh release view v${version}`)
      return true
    } catch {
      return false
    }
  }

  async submitPluginIssue(pluginUrl: string) {
    const spinner = ora({
      text: chalk.yellow('🎯 Submitting plugin to Blinko marketplace...'),
      color: 'yellow'
    }).start()

    try {
      const issueCmd = `gh issue create --repo blinko-space/blinko-plugin-marketplace --title "[Plugin Submission] ${pluginUrl.split('/').pop()}" --body "Plugin repository: ${pluginUrl}"`
      await execAsync(issueCmd)
      spinner.succeed(chalk.green('✅ Successfully submitted plugin to marketplace'))
      this.log(chalk.blue('🌐 Opening marketplace issues page...'))
      await this.openBrowser('https://github.com/blinko-space/blinko-plugin-marketplace/issues')
    } catch (error) {
      spinner.fail(chalk.red('Failed to submit plugin'))
      throw error
    }
  }

  async run(): Promise<void> {
    const originalCwd = process.cwd()
    try {
      const {flags} = await this.parse(ReleasePlugin)
      const baseDir = path.resolve(flags.dir)

      // Change working directory to baseDir
      process.chdir(baseDir)

      this.log(chalk.blue(`🔍 Checking required files in ${baseDir}...`))
      this.checkRequiredFiles(baseDir)
      this.log(chalk.green('✅ Required files check passed'))

      // Check and install GitHub CLI
      this.log(chalk.blue('🔍 Checking GitHub CLI...'))
      await this.checkAndInstallGitHubCLI()

      // Check GitHub authentication status
      this.log(chalk.blue('🔍 Checking GitHub authentication...'))
      try {
        await execAsync('gh auth status')
      } catch (error) {
        this.log(chalk.yellow('🔑 Please login to GitHub...'))
        try {
          const loginProcess = spawn('gh', ['auth', 'login'], {stdio: 'inherit'})
          await new Promise((resolve, reject) => {
            loginProcess.on('close', code => {
              code === 0 ? resolve(null) : reject(new Error(`Process exited with code ${code}`))
            })
          })
        } catch (loginError) {
          this.error(chalk.red('❌ GitHub login failed'))
          this.exit(1)
        }
      }

      const pluginData = JSON.parse(fs.readFileSync('plugin.json', 'utf-8'))
      const version = pluginData.version
      
      // Check if release version exists
      if (await this.checkReleaseExists(version)) {
        this.log(chalk.yellow(`⚠️ Release v${version} already exists!`))
        const releaseProcess = spawn('gh', ['release', 'delete', `v${version}`, '--yes'], {stdio: 'inherit'})
        await new Promise((resolve, reject) => {
          releaseProcess.on('close', code => {
            code === 0 ? resolve(null) : reject(new Error(`Process exited with code ${code}`))
          })
        })
        this.log(chalk.blue('🗑️ Old release deleted'))
      }
      
      // Create release package
      this.log(chalk.yellow('📦 Creating release package...'))
      const zip = new AdmZip()
      zip.addLocalFolder('release')
      zip.writeZip('release.zip')
      
      // Get repository information
      this.log(chalk.blue('🔍 Getting repository information...'))
      const {stdout: remoteUrl} = await execAsync('git remote get-url origin')
      const matches = remoteUrl.trim().match(/github\.com[:/](.+)\/(.+)\.git$/)
      if (!matches || !matches[1] || !matches[2]) {
        throw new Error('Invalid GitHub repository URL')
      }
      
      // Create GitHub release
      const spinner = ora({
        text: chalk.yellow('🚀 Creating GitHub release...'),
        color: 'yellow'
      }).start()

      try {
        const releaseCmd = `gh release create v${version} release.zip --title "Release v${version}" --notes "Plugin release version ${version}"`
        await execAsync(releaseCmd)
        spinner.succeed(chalk.green('✅ Successfully created release v' + version))

        // Get current repository URL
        const {stdout: repoUrl} = await execAsync('gh repo view --json url -q .url')
        
        // Submit plugin to marketplace
        this.log(chalk.blue('\n📮 Submitting plugin to marketplace...'))
        await this.submitPluginIssue(repoUrl.trim())
        
      } catch (error) {
        spinner.fail(chalk.red('Failed to create release'))
        throw error
      }
      
      // Cleanup: remove temporary zip file
      fs.unlinkSync('release.zip')
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.displayError(error.message)
      } else {
        this.displayError('Unknown error occurred')
      }
    } finally {
      // Restore original working directory
      process.chdir(originalCwd)
    }
  }
} 