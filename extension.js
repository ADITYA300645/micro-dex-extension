const vscode = require('vscode');
const { JsonFileCreatorProvider } = require('./JsonFileCreatorProvider');
const { createFiles, processFiles } = require('./fileUtils');
const { getQueryResult } = require('./queryReq');

function activate(context) {
    const provider = new JsonFileCreatorProvider();
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(JsonFileCreatorProvider.viewType, provider)
    );

    const createFilesCommand = vscode.commands.registerCommand('jsonFileCreator.createFiles', async (query) => {
        if (query) {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Fetching data...",
                    cancellable: false
                },
                async (progress, token) => {
                    try {
                        query = query + " return the change in the Given Styled Json Format [{fileName:'someFilename.js',content:'thefullfilecontent',shellScript:'some Commands to run',explaination:'Some words from AI Regardding whats been sent back'}] also Generate each files As Given in Query ... Only Provide Json File No Thing ELSE";
                        
                        var returnVal = await getQueryResult(query, "66e4ad559b3af8875a1f62ab");
                        processFiles(returnVal);

                        // Loop through the array and call updateWebviewContent for each explanation
                        returnVal.forEach(item => {
                            const explanation = item.explaination || "No explanation provided.";
                            provider.updateWebviewContent(explanation);
                        });

                    } catch (error) {
                        vscode.window.showErrorMessage(`Error: ${error}`);
                    }
                }
            );
        }
    });

    context.subscriptions.push(createFilesCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
