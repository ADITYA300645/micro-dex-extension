const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function processFiles(query) {
    try {
        if (Array.isArray(query)) {
            for (const item of query) {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
                const filePath = path.join(workspaceFolder, item.fileName);

                if (fs.existsSync(filePath)) {
                    const existingContent = fs.readFileSync(filePath, 'utf8');
                    const userAction = await showSideBySideComparison(existingContent, item.content, item.fileName);
                    if (userAction === 'Apply') {
                        await createFiles(item);
                    } else {
                        vscode.window.showWarningMessage('File creation canceled.');
                    }
                } else {
                    const action = await vscode.window.showInformationMessage(
                        `New File: ${item.fileName}\nContent: ${item.content || 'No content'}`,
                        { modal: true },
                        'Apply', 'Cancel'
                    );
                    if (action === 'Apply') {
                        await createFiles(item);
                    } else {
                        vscode.window.showWarningMessage('File creation canceled.');
                    }
                }
            }
        } else {
            vscode.window.showErrorMessage('Invalid query result. Expected an array.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}

async function showSideBySideComparison(existingContent, newContent, fileName) {
    const panel = vscode.window.createWebviewPanel(
        'fileComparison', 
        `Compare: ${fileName}`, 
        vscode.ViewColumn.One, 
        { enableScripts: true, retainContextWhenHidden: true }
    );

    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const existingLines = escapeHtml(existingContent).split('\n');
    const newLines = escapeHtml(newContent).split('\n');
    
    const leftColumnHtml = existingLines.map(line => `<div style="background-color: #1e293b; padding: 4px;">${line || ''}</div>`).join('');
    const rightColumnHtml = newLines.map(line => `<div style="background-color: #334155; padding: 4px;">${line || ''}</div>`).join('');

    panel.webview.html = `
        <html lang="en">
        <head>
            <style>
                body {
                    font-family: sans-serif;
                    background-color: #0f172a;
                    color: #ffffff;
                    padding: 20px;
                    margin: 0;
                }
                .container {
                    display: flex;
                    max-width: 100%;
                    justify-content: space-between;
                }
                .column {
                    width: 49%;
                    overflow-y: auto;
                    max-height: 400px;
                    border: 1px solid #ffffff;
                    border-radius: 5px;
                }
                .column div {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    padding: 4px;
                    font-size: 14px;
                }
                .action-buttons {
                    text-align: center;
                    margin-top: 20px;
                }
                button {
                    padding: 10px 20px;
                    background-color: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 0 5px;
                }
                button:hover {
                    background-color: #4f46e5;
                }
            </style>
        </head>
        <body>
            <h2>Side-by-Side Comparison of File: ${fileName}</h2>
            <div class="container">
                <div class="column" style="background-color: #1e293b;">
                    ${leftColumnHtml || '<div>No content in existing file</div>'}
                </div>
                <div class="column" style="background-color: #334155;">
                    ${rightColumnHtml || '<div>No content in new file</div>'}
                </div>
            </div>
            <div class="action-buttons">
                <button onclick="applyChanges()">Apply</button>
                <button onclick="cancelChanges()">Cancel</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function applyChanges() {
                    vscode.postMessage({ command: 'apply' });
                }
                function cancelChanges() {
                    vscode.postMessage({ command: 'cancel' });
                }
            </script>
        </body>
        </html>
    `;

    return new Promise((resolve) => {
        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'apply') {
                resolve('Apply');
                panel.dispose();
            } else if (message.command === 'cancel') {
                resolve('Cancel');
                panel.dispose();
            }
        });
    });
}

async function createFiles(fileData) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (workspaceFolder) {
        const filePath = path.join(workspaceFolder, fileData.fileName);
        fs.writeFile(filePath, fileData.content, (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Failed to create file ${fileData.fileName}: ${err.message}`);
            } else {
                vscode.window.showInformationMessage(`File ${fileData.fileName} created successfully.`);
            }
        });
    } else {
        vscode.window.showErrorMessage('No workspace folder found.');
    }
}

module.exports = {
    processFiles,
    createFiles
};
