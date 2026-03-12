const vscode = require('vscode');
const pty = require('node-pty');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

function activate(context) {
    const EXT       = context.extensionPath;
    const BIN       = path.join(EXT, 'bin');
    const MSDOS     = path.join(BIN, 'msdos.exe');
    const BUILD_BAT = path.join(EXT, 'build.bat');

    const cyan = s => `\x1b[96m${s}\x1b[0m`;
    const line = cyan('────────────────────────────────────────');

    let cmd = vscode.commands.registerCommand('asm.run', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const file = editor.document.fileName;
        if (!file.endsWith('.asm')) {
            vscode.window.showErrorMessage('Current file is not .asm');
            return;
        }

        await editor.document.save();

        const asmName  = path.basename(file, '.asm');
        const fileDir  = path.dirname(file);
        const BUILD    = path.join(fileDir, '_build');
        const LOG      = path.join(BUILD, '_build.log');
        const exePath  = path.join(BUILD, asmName + '.exe');

        if (!fs.existsSync(BUILD)) fs.mkdirSync(BUILD, { recursive: true });

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `ASM: building ${asmName}...`,
            cancellable: false
        }, () => new Promise((resolve) => {

            cp.execFile('cmd.exe', ['/c', BUILD_BAT, file, EXT, fileDir], { timeout: 30000 }, (error) => {
                resolve();

                const log = fs.existsSync(LOG)
                    ? fs.readFileSync(LOG, 'utf8')
                    : '';

                const hasError = log.includes('** Error') || log.includes('Fatal') || !fs.existsSync(exePath);

                if (hasError) {
                    const t = vscode.window.createTerminal('ASM Build Error');
                    t.show(true);
                    t.sendText(`type "${LOG}"`);
                    return;
                }

                let ptyProc;
                try {
                    ptyProc = pty.spawn(MSDOS, [exePath], {
                        name: 'xterm-color',
                        cols: 80,
                        rows: 25,
                        cwd: BUILD,
                        env: process.env,
                        useConpty: false
                    });
                } catch(e) {
                    vscode.window.showErrorMessage(`PTY error: ${e.message}`);
                    return;
                }

                const writeEmitter = new vscode.EventEmitter();
                const closeEmitter = new vscode.EventEmitter();

                let waitingForKey = false;

                const pseudoTerminal = {
                    onDidWrite: writeEmitter.event,
                    onDidClose: closeEmitter.event,
                    open: () => {
                        writeEmitter.fire('\r\n');
                        writeEmitter.fire(line + '\r\n');
                        writeEmitter.fire(cyan(`             RUN  ${asmName}.exe`) + '\r\n');
                        writeEmitter.fire(line + '\r\n\r\n');

                        ptyProc.onData(data => writeEmitter.fire(data));

                        ptyProc.onExit(() => {
                            waitingForKey = true;
                            writeEmitter.fire('\r\n');
                            writeEmitter.fire(line + '\r\n');
                            writeEmitter.fire(cyan('                 DONE') + '\r\n');
                            writeEmitter.fire(line + '\r\n');
                        });
                    },
                    close: () => ptyProc.kill(),
                    handleInput: (data) => {
                        if (waitingForKey) {
                            waitingForKey = false;
                            return;
                        }
                        ptyProc.write(data);
                    }
                };

                vscode.window.createTerminal({
                    name: `▶ ${asmName}`,
                    pty: pseudoTerminal
                }).show(true);
            });
        }));
    });

    context.subscriptions.push(cmd);
}

function deactivate() {}
module.exports = { activate, deactivate };