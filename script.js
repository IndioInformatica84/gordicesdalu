document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÕES ---
    const numeroWhatsapp = '5591983750760';
    const menuItens = [
        "Cento dos docinhos",
        "Bolo de 20cm (sem o topo)",
        "Bolo de 15cm (sem o topo)",
        "Torta salgada de um pão",
        "Kit festa (bolo de 15cm + 50 salgadinhos + 30 docinhos)",
        "Kit festa (bolo de 20cm + 30 docinhos e 50 salgadinhos, com o topo simples)",
        "Cento dos salgados"
    ];

    // --- ELEMENTOS DO DOM ---
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const quickRepliesContainer = document.getElementById('quick-replies');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const backgroundMusic = document.getElementById('background-music'); // Get the audio element

    // --- ESTADO DO CHAT ---
    let currentStep = 'ask_name';
    let orderDetails = {
        name: '',
        items: []
    };
    let tempItem = '';
    let hasInteracted = false; // Flag to track user interaction for audio

    // --- FUNÇÕES DO CHAT ---

    // Adiciona uma mensagem na tela do chat
    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        // Rola para a mensagem mais recente
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Limpa os botões de resposta rápida
    const clearQuickReplies = () => {
        quickRepliesContainer.innerHTML = '';
    };

    // Mostra os botões de resposta rápida
    const showQuickReplies = (replies) => {
        clearQuickReplies();
        replies.forEach(replyText => {
            const replyBtn = document.createElement('button');
            replyBtn.classList.add('quick-reply-btn');
            replyBtn.textContent = replyText;
            replyBtn.addEventListener('click', () => {
                userInput.value = replyText;
                handleUserInput();
                playBackgroundMusic(); // Try to play music on quick reply click
            });
            quickRepliesContainer.appendChild(replyBtn);
        });
    };

    // Lida com a entrada do usuário e avança o chat
    const handleUserInput = () => {
        const text = userInput.value.trim();
        if (text === '') return;

        addMessage(text, 'user');
        userInput.value = ''; // Limpa o campo de entrada
        clearQuickReplies(); // Remove botões após a resposta
        playBackgroundMusic(); // Try to play music on user input

        setTimeout(() => processStep(text), 500); // Adiciona um pequeno delay para a resposta do bot
    };

    // Processa cada etapa da conversa
    const processStep = (userInputText) => {
        switch (currentStep) {
            case 'ask_name':
                orderDetails.name = userInputText;
                addMessage(`Prazer, ${orderDetails.name}! 👋 O que você gostaria de pedir hoje?`, 'bot');
                showQuickReplies(menuItens);
                currentStep = 'ask_item';
                break;

            case 'ask_item':
                if (menuItens.includes(userInputText)) {
                    tempItem = userInputText;
                    addMessage(`Ótima escolha! Quantos "${tempItem}" você gostaria?`, 'bot');
                    currentStep = 'ask_quantity';
                } else {
                    addMessage('Desculpe, não encontrei esse item no cardápio. Por favor, escolha uma das opções abaixo.', 'bot');
                    showQuickReplies(menuItens);
                }
                break;

            case 'ask_quantity':
                const quantity = parseInt(userInputText, 10);
                if (!isNaN(quantity) && quantity > 0) {
                    orderDetails.items.push({ product: tempItem, quantity: quantity });
                    tempItem = ''; // Limpa o item temporário
                    addMessage(`Adicionado! ✅ Deseja mais alguma coisa?`, 'bot');
                    showQuickReplies(['Sim', 'Não']);
                    currentStep = 'ask_more_items';
                } else {
                    addMessage('Por favor, digite um número válido.', 'bot');
                }
                break;

            case 'ask_more_items':
                if (userInputText.toLowerCase() === 'sim') {
                    addMessage('O que mais você gostaria?', 'bot');
                    showQuickReplies(menuItens);
                    currentStep = 'ask_item';
                } else if (userInputText.toLowerCase() === 'não') {
                    addMessage('Perfeito! Seu pedido está quase pronto. Por favor, confirme os itens abaixo.', 'bot');
                    showOrderSummary();
                    currentStep = 'final_confirmation';
                } else {
                    addMessage('Por favor, responda com "Sim" ou "Não".', 'bot');
                    showQuickReplies(['Sim', 'Não']);
                }
                break;

            case 'final_confirmation':
                 addMessage('Para finalizar, clique no botão "Confirmar e Enviar Pedido" abaixo. Se precisar alterar algo, por favor, atualize a página para recomeçar.', 'bot');
                 break;
        }
    };

    // Mostra o resumo do pedido e o botão de confirmação
    const showOrderSummary = () => {
        let summary = 'Resumo do Pedido:\n\n';
        orderDetails.items.forEach(item => {
            summary += `- ${item.quantity}x ${item.product}\n`;
        });

        addMessage(summary, 'bot');
        confirmOrderBtn.classList.remove('hidden');
        document.getElementById('chat-input-container').classList.add('hidden'); // Esconde o campo de input
    };

    // Gera a mensagem final e envia para o WhatsApp
    const sendOrderToWhatsApp = () => {
        let message = `Olá, Gordices da Lú! \n\nGostaria de fazer um pedido.\n\n*Cliente:* ${orderDetails.name}\n\n*Pedido:*\n`;
        orderDetails.items.forEach(item => {
            message += `• ${item.quantity}x ${item.product}\n`;
        });
        message += `\nAguardando confirmação. Obrigado!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${numeroWhatsapp}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    // Function to play background music
    const playBackgroundMusic = () => {
        if (backgroundMusic.paused) { // Only try to play if it's paused
            backgroundMusic.muted = false; // Unmute the audio
            backgroundMusic.play().then(() => {
                console.log("Music started playing!");
                hasInteracted = true; // Set flag to true after successful play
            }).catch(e => {
                console.log("Autoplay prevented:", e);
                // Fallback: If autoplay fails, we could add a visible play button
                // or just let it be silent until a more direct user interaction.
            });
        }
    };

    // --- EVENT LISTENERS ---
    sendBtn.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });
    confirmOrderBtn.addEventListener('click', sendOrderToWhatsApp);

    // Initial interaction listener for the whole document to enable audio
    document.addEventListener('click', playBackgroundMusic, { once: true });
    
    // Play music on scroll, but only if it's not already playing
    document.addEventListener('scroll', () => {
        playBackgroundMusic();
    });
    
    userInput.addEventListener('focus', playBackgroundMusic, { once: true }); // And on input focus

    // --- INICIA O CHAT ---
    setTimeout(() => {
        addMessage('Olá! Sou a assistente virtual da Gordices da Lu. 🍰', 'bot');
        setTimeout(() => {
             addMessage('Para começar, qual o seu nome?', 'bot');
        }, 800);
    }, 500);

    type="text/javascript">
    aclib.runAutoTag({
        zoneId: 'kxc774s7nk',
    });


});
// --- FIM DO CÓDIGO ---