const axios = require('axios');
const vscode = require('vscode');

const securedKey = "Vg3ot5G372pp8o2lye9c0JbBVKE080dk";
const externalUserId = "OKAYOKAY";

async function submitQuery(sessionId, query) {
    try {
        const response = await axios.post(
            `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
            {
                endpointId: "predefined-openai-gpt4o",
                query: query,
                pluginIds: ["plugin-1712327325", "plugin-1713962163"],
                responseMode: "sync",
            },
            {
                headers: {
                    apikey: securedKey,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error submitting query:", error);
        throw error;
    }
}

function extractJSON(text) {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
        let jsonString = text.substring(start, end + 1);
        try {
            console.log(jsonString);
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Invalid JSON string:", e);
            return null;
        }
    }
    return null;
}

async function getQueryResult(query, sessionId) {
    const fullQuery = `${query} return the change in the Given Styled Json Format [{fileName:'someFilename.js',content:'thefullfilecontent',shellScript:'some Commands to run',explaination:'Some words from AI Regardding whats been sent back'}] also Generate each files As Given in Query ... Only Provide Json File No Thing ELSE`;

    const response = await submitQuery(sessionId, fullQuery);
    vscode.window.showWarningMessage(`${JSON.stringify(response)}`);
    const json = extractJSON(response.data.answer);
    return json;
}

module.exports = {
    getQueryResult
};
