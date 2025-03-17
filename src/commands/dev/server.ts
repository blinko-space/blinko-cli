import { Command, Flags } from '@oclif/core'
import { WebSocketServer, WebSocket } from "ws"
import { spawn } from "child_process"
import { watch } from "fs"
import * as fs from "fs"
import * as path from "path"
import chalk from "chalk"
import { networkInterfaces } from "os"
import * as http from "http"

interface BlinkoPluginMetadata {
  name: string
  version: string
  [key: string]: any
}

interface ServerOptions {
  wsPort?: number
  httpPort?: number
  distDir?: string
  pluginJsonPath?: string
  viteCommand?: string
}

class BlinkoDevServer {
  private wss: WebSocketServer
  private httpServer: http.Server | null = null
  private debounceTimer: NodeJS.Timeout | null = null
  private options: Required<ServerOptions>
  private pluginMetadata: BlinkoPluginMetadata

  constructor(options: ServerOptions = {}) {
    this.options = {
      wsPort: options.wsPort || 8080,
      httpPort: options.httpPort || 3000,
      distDir: options.distDir || "./dist",
      pluginJsonPath: options.pluginJsonPath || "./plugin.json",
      viteCommand: options.viteCommand || "vite"
    }

    // Load plugin metadata
    try {
      this.pluginMetadata = this.loadPluginMetadata()
    } catch (error) {
      console.warn(chalk.yellow("⚠️ Warning: Could not load plugin.json. Using default metadata."))
      this.pluginMetadata = {
        name: "Blinko Plugin",
        version: "0.0.0"
      }
    }

    // Initialize WebSocket server
    this.wss = new WebSocketServer({
      port: this.options.wsPort,
      // Add CORS headers in the upgrade process
      verifyClient: (info: any, cb: (result: boolean) => void) => {
        // Allow all origins
        if (info.req.headers.origin) {
          info.req.headers["access-control-allow-origin"] = "*"
        }
        cb(true)
      },
    })
  }

  /**
   * Loads plugin metadata from plugin.json
   */
  private loadPluginMetadata(): BlinkoPluginMetadata {
    const pluginPath = path.resolve(process.cwd(), this.options.pluginJsonPath)
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`plugin.json not found at ${pluginPath}`)
    }
    return JSON.parse(fs.readFileSync(pluginPath, 'utf-8'))
  }

  /**
   * Retrieves the latest build file from the dist directory.
   */
  private getLatestBuildFile(): string | undefined {
    const files = fs.readdirSync(this.options.distDir)
    return files.find(
      (file) => file.startsWith("index_") && file.endsWith(".js")
    )
  }

  /**
   * Sends the latest build code to a connected WebSocket client.
   */
  private sendLatestCode(client: WebSocket): void {
    try {
      const fileName = this.getLatestBuildFile()
      if (!fileName) {
        console.error(chalk.red("❌ No build file found."))
        return
      }

      const code = fs.readFileSync(path.join(this.options.distDir, fileName), "utf-8")
      console.log(
        chalk.green(
          `📦 Build code size: ${code.length} bytes, Filename: ${fileName}`
        )
      )

      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(
          JSON.stringify({
            type: "code",
            fileName,
            metadata: this.pluginMetadata,
            code: code,
          })
        )
      }
    } catch (error) {
      console.error(chalk.red("❌ Failed to read file:"), error)
    }
  }

  /**
   * Get the local network IP address
   */
  private getLocalIP(): string {
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      const interfaces = nets[name]
      if (!interfaces) continue

      for (const net of interfaces) {
        // Only get IPv4 addresses, non-internal, and starting with 192.168 or 10.
        if (
          net.family === "IPv4" &&
          !net.internal &&
          (net.address.startsWith("192.168.") || net.address.startsWith("10."))
        ) {
          return net.address
        }
      }
    }
    return "localhost" // Return localhost if no suitable IP is found
  }

  /**
   * Ensures the dist directory exists
   */
  private ensureDistDirectory(): void {
    const distPath = this.options.distDir
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true })
      console.log(chalk.green(`📁 Created ${distPath} directory`))
    }
  }

  /**
   * Creates a simple HTTP server to display connection instructions
   */
  private createHttpServer(): void {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Blinko Plugin Development Server</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 800px;
                margin: 40px auto;
                padding: 0 20px;
                line-height: 1.6;
                color: #333;
              }
              .container {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .code {
                background: #e0e0e0;
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                cursor: pointer;
                position: relative;
                transition: background-color 0.2s;
              }
              .code:hover {
                background: #d0d0d0;
              }
              .code::after {
                content: 'Click to copy';
                position: absolute;
                right: 10px;
                font-size: 12px;
                color: #666;
                opacity: 0;
                transition: opacity 0.2s;
              }
              .code:hover::after {
                opacity: 1;
              }
              .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border-radius: 4px;
                display: none;
                animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
              }
            </style>
          </head>
          <body>
            <div id="toast" class="toast">Copied to clipboard!</div>
            <h1>🔌 Blinko Plugin Development Server</h1>
            <div class="container">
              <h2>Connection Instructions:</h2>
              <p>Please enter the following WebSocket URL in your Blinko plugin settings:</p>
              
              <p>Local Network Access:</p>
              <div class="code" onclick="copyToClipboard(this)">
                ws://${this.getLocalIP()}:${this.options.wsPort}
              </div>
              
              <p>Local Access:</p>
              <div class="code" onclick="copyToClipboard(this)">
                ws://localhost:${this.options.wsPort}
              </div>
  
              <p>External Access:</p>
              <div class="code" onclick="copyToClipboard(this)">
                ws://\${window.location.hostname}:${this.options.wsPort}
              </div>
            </div>
            <div class="container">
              <h3>Plugin Information:</h3>
              <p><strong>Name:</strong> ${this.pluginMetadata.name}</p>
              <p><strong>Version:</strong> ${this.pluginMetadata.version}</p>
            </div>
            <p class="highlight">Note: Keep this window open while developing your plugin.</p>
  
            <script>
              // Update the external access URL on page load
              document.addEventListener('DOMContentLoaded', () => {
                const externalUrlElement = document.querySelector('.code:last-of-type');
                if (externalUrlElement) {
                  const hostname = window.location.hostname;
                  // Handle CodeSandbox and other development domains
                  const wsHostname = hostname.replace(/-\\d{4}\\.preview\\.csb\\.app$/, '-${this.options.wsPort}.preview.csb.app')
                                        .replace(/-${this.options.httpPort}\\./, '-${this.options.wsPort}.');
                  externalUrlElement.textContent = \`ws://\${wsHostname}\`;
                }
              });
  
              function copyToClipboard(element) {
                const text = element.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                  showToast();
                }).catch(() => {
                  // Fallback for browsers that don't support clipboard API
                  const textarea = document.createElement('textarea');
                  textarea.value = text;
                  document.body.appendChild(textarea);
                  textarea.select();
                  try {
                    document.execCommand('copy');
                    showToast();
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                  document.body.removeChild(textarea);
                });
              }
  
              function showToast() {
                const toast = document.getElementById('toast');
                toast.style.display = 'block';
                setTimeout(() => {
                  toast.style.display = 'none';
                }, 2000);
              }
            </script>
          </body>
        </html>
      `
      res.end(html)
    })

    server.listen(this.options.httpPort, () => {
      console.log(
        chalk.cyan(
          `📝 Documentation server running at http://${this.getLocalIP()}:${this.options.httpPort}`
        )
      )
      console.log(chalk.cyan(`📝 Local access: http://localhost:${this.options.httpPort}`))
    })

    this.httpServer = server
  }

  /**
   * Start the Vite build process with watch mode
   */
  private startViteBuild(): void {
    spawn(this.options.viteCommand, ["build", "--watch", "--mode", "dev"], {
      stdio: "inherit",
      shell: true,
    })
  }

  /**
   * Watch for file changes in the dist directory
   */
  private watchDistDirectory(): void {
    watch(this.options.distDir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith(".js")) {
        // Clear the previous timer
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer)
        }

        // Set a new debounce timer
        this.debounceTimer = setTimeout(() => {
          console.log(chalk.blue(`🔄 Build completed, file updated: ${filename}`))
          this.wss.clients.forEach(client => this.sendLatestCode(client))
        }, 100) // 100ms debounce delay
      }
    })
  }

  /**
   * Initialize and start the server
   */
  public start(): void {
    this.ensureDistDirectory()
    this.createHttpServer()
    this.startViteBuild()
    
    this.wss.on("connection", (client: WebSocket) => {
      console.log(chalk.green("🔌 New Blinko client connected"))
      this.sendLatestCode(client)
    })

    this.watchDistDirectory()

    console.log(
      chalk.cyan(`🎉 WebSocket server running at ws://${this.getLocalIP()}:${this.options.wsPort}`)
    )
    console.log(
      chalk.yellow(`ℹ️  Open http://localhost:${this.options.httpPort} for connection instructions`)
    )
  }

  /**
   * Stop the server
   */
  public stop(): void {
    if (this.httpServer) {
      this.httpServer.close()
    }
    this.wss.close()
    console.log(chalk.red("🛑 Blinko dev server stopped"))
  }
}

export default class DevServer extends Command {
  static description = 'Start a development server for Blinko plugins with hot-reloading'

  static examples = [
    `$ blinko-cli dev server
Starting Blinko development server...`,
    `$ blinko-cli dev server --ws-port=9000 --http-port=4000
Starting Blinko development server with custom ports...`,
  ]

  static flags = {
    'ws-port': Flags.integer({
      description: 'WebSocket server port',
      default: 8080,
    }),
    'http-port': Flags.integer({
      description: 'HTTP documentation server port',
      default: 3000,
    }),
    'dist-dir': Flags.string({
      description: 'Directory containing build output',
      default: './dist',
    }),
    'plugin-json': Flags.string({
      description: 'Path to plugin.json file',
      default: './plugin.json',
    }),
    'vite-command': Flags.string({
      description: 'Vite command to run',
      default: 'vite',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(DevServer)

    const options: ServerOptions = {
      wsPort: flags['ws-port'],
      httpPort: flags['http-port'],
      distDir: flags['dist-dir'],
      pluginJsonPath: flags['plugin-json'],
      viteCommand: flags['vite-command'],
    }

    this.log(chalk.blue('🚀 Starting Blinko development server...'))
    
    const server = new BlinkoDevServer(options)
    server.start()

    // Handle termination signals
    process.on('SIGINT', () => {
      this.log('\nShutting down server...')
      server.stop()
      this.exit(0)
    })

    process.on('SIGTERM', () => {
      this.log('\nShutting down server...')
      server.stop()
      this.exit(0)
    })
  }
}
