// chat.js

(function() {
    // Add the required HTML structure
    const chatHTML = `
        <link href='//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css' rel='stylesheet' type='text/css'>
        <style>
        :root {
            /*--primary-color: #2962ff;*/
            --primary-color: #356afd;
            --secondary-color: #0039cb;
            --background-color: #ffffff;
            --text-color: #333333;
            --message-bg-user: var(--primary-color);
            --message-bg-bot: #f5f5f5;
        }

        /*:root {
            --primary-color: linear-gradient(135deg, #4776E6E8, #8E54E9CF);
            --message-bg-user: linear-gradient(135deg, #4776E6E8, #8E54E9CF);
        }*/

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        #chat-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
        }

        #chat-button:hover {
            background: var(--secondary-color);
            transform: scale(1.1);
        }

        #chat-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            background: var(--background-color);
            border-radius: 20px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            transform-origin: bottom right;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
        }

        #chat-container.open {
            display: flex;
            animation: popIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes popIn {
            0% {
                transform: scale(0.3);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        #chat-header {
            padding: 20px;
            background: var(--primary-color);
            color: white;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        #chat-header h2 {
            font-size: 1.2rem;
            font-weight: 500;
        }

        #clear-chat {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 0.9rem;
            transition: background 0.3s ease;
        }

        #clear-chat:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        #chat-messages {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            scroll-behavior: smooth;
        }

        #chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        #chat-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        #chat-messages::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 18px;
            max-width: 85%;
            position: relative;
            animation: messageIn 0.3s ease-out;
            word-wrap: break-word;
            white-space: pre-wrap;
        }

        @keyframes messageIn {
            0% {
                transform: translateY(20px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .user-message {
            background: var(--message-bg-user);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 5px;
            text-align: left;
            width: fit-content;
            min-width: 50px;
            max-width: 70%; /* Limit the width of user messages */
            font-family: 'Spoqa Han Sans Neo', 'sans-serif';
        }

        .bot-message {
            background: var(--message-bg-bot);
            color: var(--text-color);
            margin-right: auto;
            border-bottom-left-radius: 5px;
            text-align: left;
            width: fit-content;
            min-width: 50px;
            max-width: 85%;
            font-family: 'Spoqa Han Sans Neo', 'sans-serif';
        }

        .typing-indicator {
            display: flex;
            padding: 12px 16px;
            background: var(--message-bg-bot);
            border-radius: 18px;
            margin-bottom: 15px;
            width: fit-content;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #90949c;
            border-radius: 50%;
            margin: 0 2px;
            animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: 200ms; }
        .typing-dot:nth-child(2) { animation-delay: 300ms; }
        .typing-dot:nth-child(3) { animation-delay: 400ms; }

        @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }

        #chat-input-container {
            padding: 15px;
            border-top: 1px solid #eee;
            background: white;
            border-radius: 0 0 20px 20px;
        }

        .input-wrapper {
            display: flex;
            align-items: center;
            background: #f5f5f5;
            border-radius: 25px;
            padding: 5px;
            gap: 10px; /* Add space between input and button */
        }

        #chat-input {
            flex-grow: 1;
            padding: 12px 15px;
            border: none;
            background: transparent;
            outline: none;
            font-size: 1rem;
            color: var(--text-color);
            min-width: 0; /* Prevents input from overflowing */
        }

        #send-button {
            padding: 10px;
            min-width: 44px;
            height: 44px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 22px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0; /* Prevents button from shrinking */
        }

        #send-button:hover {
            background: var(--secondary-color);
            transform: scale(1.05);
        }

        #send-button svg {
            width: 20px;
            height: 20px;
        }

        /* Update mobile styles */
        @media (max-width: 480px) {
            #chat-container {
                width: 100%;
                height: 100%;
                right: 0;
                bottom: 0;
                border-radius: 0;
            }

            #chat-button {
                bottom: 15px;/ /* Move chat button up to avoid overlap with input */
                right: 20px;
                width: 50px;
                height: 50px;
            }

            #chat-header {
                border-radius: 0;
            }

            .message {
                max-width: 85%;
            }

            .user-message {
                max-width: 75%;
            }

            #chat-input-container {
                border-radius: 0;
                padding: 10px;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            }

            .input-wrapper {
                margin: 0;
                margin-right: 4rem;
            }

            #chat-messages {
                padding-bottom: 70px; /* Add padding to prevent messages from being hidden behind input */
            }

            /* Adjust chat container when open */
            #chat-container.open {
                padding-bottom: 60px;
            }
        }

        /* Animation for new messages */
        @keyframes slideIn {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Pulse animation for chat button */
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(41, 98, 255, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(41, 98, 255, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(41, 98, 255, 0);
            }
        }

        #chat-button.pulse {
            animation: pulse 2s infinite;
        }

        /* Add styles for message timestamps if needed */
        .message-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 5px;
        }

        /* Improve scrollbar styling */
        #chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        #chat-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        #chat-messages::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }

        #chat-messages::-webkit-scrollbar-thumb:hover {
            background: #707070;
        }

        .chatbot-message {
            all: unset;
            font-family: 'Spoqa Han Sans Neo', 'sans-serif';
        }

        .chatbot-message a {
            color: var(--primary-color);
            text-decoration: underline;
            cursor: pointer;
        }
        </style>

        <button id="chat-button" class="pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>

        <div id="chat-container">
            <div id="chat-header">
                <h2 style='color: white'>SCIS Introducer</h2>
                <button id="clear-chat">Clear Chat</button>
            </div>
            <div id="chat-messages">
                <div class="message bot-message">Hello! Welcome to the SCIS website. You can ask anything about SCIS!

안녕하세요! 수원기독국제학교 웹사이트에 오신것을 환영합니다. 학교에 대해 무엇이든 물어보세요!</div>
            </div>
            <div id="chat-input-container">
                <div class="input-wrapper">
                    <input type="text" id="chat-input" placeholder="Ask Anything!">
                    <button id="send-button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    
    // Create a function to initialize the chat
    function initChat() {
        // Create a container for the chat elements
        const chatWrapper = document.createElement('div');
        chatWrapper.id = 'scis-chat-wrapper';
        chatWrapper.innerHTML = chatHTML;
        document.body.appendChild(chatWrapper);

        // Initialize all the variables and event listeners
        const chatButton = document.getElementById('chat-button');
        const chatContainer = document.getElementById('chat-container');
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');
        const clearChatButton = document.getElementById('clear-chat');
        let isOpen = false;
        let conversationHistory = [];
        let isTyping = false;

        window.isSystemPromptAdded = false;

        if (!isSystemPromptAdded) {
            conversationHistory.unshift({
                role: "system",
                content: SYSTEM_PROMPT
            });
            isSystemPromptAdded = true; // Update the flag
            console.log('System prompt added:', SYSTEM_PROMPT,);
        }



        // Load conversation history from localStorage
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            conversationHistory
                .filter((msg) => msg.role !== 'system') // Exclude system prompt
                .forEach((msg) => {
                    addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot', false);
                });
        }
        

        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return typingDiv;
        }

        function removeTypingIndicator(indicator) {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }

        function printHistory() {
            console.group('Conversation History');
            console.log(JSON.stringify(conversationHistory, null, 2));
            console.groupEnd();
        }

        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message || isTyping) return;
        
            addMessage(message, 'user', true);
            printHistory();
            chatInput.value = '';
            isTyping = true;
        
            const typingIndicator = showTypingIndicator();
        
            if (conversationHistory.length === 0) {
                if (typeof SYSTEM_PROMPT === 'undefined') {
                    console.error('SYSTEM_PROMPT is not defined!');
                } else {
                    console.log('Adding system prompt:', SYSTEM_PROMPT);
                    conversationHistory.push({
                        role: "system",
                        content: SYSTEM_PROMPT
                    });
                }
            }
                        
            try {
                const response = await fetch('https://gpt4omini-6ucx5cuf.b4a.run/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        provider: 'DDG',
                        messages: conversationHistory
                    })
                });
        
                const data = await response.json();
                removeTypingIndicator(typingIndicator);
                
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const botResponse = data.choices[0].message.content;
                    addMessage(botResponse, 'bot', true);
                }
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator(typingIndicator);
                addMessage('Sorry, there was an error processing your request.', 'bot', true);
            }
            isTyping = false;
        }
        

        function addMessage(text, sender, saveToHistory = true) {
            // Skip rendering system messages in the chat interface
            if (sender === 'system') {
                if (saveToHistory) {
                    conversationHistory.push({
                        role: 'system',
                        content: text
                    });
                }
                return; // Do not render in the UI
            }
        
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
        
            if (text.includes('<') && text.includes('>')) {
                // For rendering HTML content
                messageDiv.innerHTML = text;
            } else {
                // For regular text messages
                messageDiv.textContent = text;
            }
        
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        
        
            if (saveToHistory) {
                const role = sender === 'user' ? 'user' : 'assistant';
                conversationHistory.push({
                    role: role,
                    content: text
                });
                localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
            }
        }
        
        

        // Event Listeners
        chatButton.addEventListener('click', () => {
            isOpen = !isOpen;
            chatContainer.classList.toggle('open');
            chatButton.classList.remove('pulse');
            if (isOpen) {
                chatInput.focus();
            }
        });

        clearChatButton.addEventListener('click', () => {
            chatMessages.innerHTML = `<div class="message bot-message">Hello! Welcome to the SCIS website. You can ask anything about SCIS!

안녕하세요! 수원기독국제학교 웹사이트에 오신것을 환영합니다. 학교에 대해 무엇이든 물어보세요!</div>`;
            window.isSystemPromptAdded = false;
            conversationHistory = [];

            if (!isSystemPromptAdded) {
                conversationHistory.unshift({
                    role: "system",
                    content: SYSTEM_PROMPT
                });
                isSystemPromptAdded = true; // Update the flag
                console.log('System prompt added:', SYSTEM_PROMPT,);
            }
            localStorage.removeItem('chatHistory');
        });

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Add pulse animation to chat button periodically
        setInterval(() => {
            if (!isOpen) {
                chatButton.classList.add('pulse');
            }
        }, 10000);
    }

    // Initialize the chat when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }
})();
