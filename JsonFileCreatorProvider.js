const vscode = require('vscode');

class JsonFileCreatorProvider {
    static viewType = 'jsonFileCreator.jsonFileCreatorView';

    resolveWebviewView(webviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'createFiles':
                    vscode.commands.executeCommand('jsonFileCreator.createFiles', data.value);
                    break;
            }
        });
    }

    updateWebviewContent(explanation) {
        if (this._view) {
            console.log("Updating webview with explanation:", explanation); // Add this for debugging
            this._view.webview.postMessage({ type: 'updateContent', explanation: explanation });
        }
    }
    

    _getHtmlForWebview(webview) {
        return `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Micro-Dex AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: #0f172a;
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 2rem;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
            padding: 1rem;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #94a3b8;
            font-size: 1rem;
        }

        .chat-container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            min-height: 400px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message {
            padding: 1rem;
            border-radius: 15px;
            max-width: 80%;
            animation: fadeIn 0.3s ease;
        }

        .user-message {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            align-self: flex-end;
        }

        .assistant-message {
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.2);
            align-self: flex-start;
        }

        .typing-indicator {
            display: flex;
            gap: 0.5rem;
            padding: 1rem;
            align-self: flex-start;
            animation: fadeIn 0.3s ease;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #a855f7;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .input-container {
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 0.5rem;
            display: flex;
            gap: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #queryInput {
            flex: 1;
            background: transparent;
            border: none;
            color: #fff;
            padding: 1rem;
            font-size: 1rem;
            outline: none;
        }

        #queryInput:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        #queryInput::placeholder {
            color: #94a3b8;
        }

        #submitButton {
            background: linear-gradient(135deg, #6366f1, #a855f7);
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        #submitButton:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        #submitButton:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .floating-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: -1;
        }

        .shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.1);
            animation: float 20s infinite linear;
        }

        .shape:nth-child(1) {
            width: 100px;
            height: 100px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 150px;
            height: 150px;
            top: 60%;
            right: 15%;
            animation-delay: -5s;
        }

        .shape:nth-child(3) {
            width: 70px;
            height: 70px;
            bottom: 20%;
            left: 20%;
            animation-delay: -10s;
        }

        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="logo">Micro-Dex</h1>
            <p class="subtitle">
                <span class="status-indicator"></span>
                Your Intelligent Assistant
            </p>
        </header>

        <main class="chat-container" id="chatContainer">
            <div class="floating-shapes">
                <div class="shape"></div>
                <div class="shape"></div>
                <div class="shape"></div>
            </div>
        </main>

        <div class="input-container">
            <input type="text" id="queryInput" placeholder="Ask me anything...">
            <button id="submitButton">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chatContainer');
        const queryInput = document.getElementById('queryInput');
        const submitButton = document.getElementById('submitButton');

        function clearChat() {
            const shapes = chatContainer.querySelector('.floating-shapes');
            chatContainer.innerHTML = '';
            if (shapes) {
                chatContainer.appendChild(shapes);
            }
        }
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'updateContent') {
                addMessage(message.explanation); // Add this line to render the explanation
            }
        });

        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
            messageDiv.textContent = text;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = \`
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            \`;
            chatContainer.appendChild(indicator);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            return indicator;
        }

        async function handleSubmit() {
            const query = queryInput.value.trim();
            if (!query) return;

            clearChat();

            queryInput.disabled = true;
            submitButton.disabled = true;

            addMessage(query, true);

            const typingIndicator = showTypingIndicator();

            try {
                vscode.postMessage({ type: 'createFiles', value: query });
                queryInput.value = '';
            } catch (error) {
                addMessage('Sorry, an error occurred. Please try again.');
            }

            setTimeout(() => {
                typingIndicator.remove();

                queryInput.disabled = false;
                submitButton.disabled = false;
                queryInput.focus();
            }, 2000);

        }

        submitButton.addEventListener('click', handleSubmit);

        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !queryInput.disabled) {
                e.preventDefault();
                handleSubmit();
            }
        });
    </script>
</body>
</html>
        `;
    }
}

module.exports = {
    JsonFileCreatorProvider
};
