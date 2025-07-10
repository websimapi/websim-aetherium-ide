document.addEventListener('DOMContentLoaded', () => {
    const runButton = document.getElementById('run-button');
    const promptInput = document.getElementById('prompt-input');
    const outputDiv = document.getElementById('output');

    const conversationHistory = [];

    const systemPrompt = `You are an AI-oriented programming language named 'Aether'. You interpret natural language prompts to generate live, sandboxed results. Your task is to interpret the user's prompt and generate a result that fulfills their request. The result MUST be valid, self-contained HTML that will be rendered directly inside a 'div' element. This HTML can include <style> and <script> tags to create interactive or styled content. You can emulate systems, generate code snippets, answer questions, or create small applications. Do not include \`<html>\`, \`<head>\`, or \`<body>\` tags in your response. Respond only with the HTML content.`;

    const setOutputLoading = (isLoading) => {
        runButton.disabled = isLoading;
        if (isLoading) {
            outputDiv.classList.add('loading');
        } else {
            outputDiv.classList.remove('loading');
        }
    };
    
    const createLoader = () => {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.textContent = 'Executing...';
        outputDiv.parentElement.insertBefore(loader, outputDiv.nextSibling);
    };

    const executePrompt = async (userPrompt) => {
        setOutputLoading(true);

        const newUserMessage = { role: 'user', content: userPrompt };
        conversationHistory.push(newUserMessage);

        // Keep history to a reasonable length
        if (conversationHistory.length > 10) {
            conversationHistory.splice(0, conversationHistory.length - 10);
        }

        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory
                ],
            });

            const aiResponse = completion.content;
            outputDiv.innerHTML = aiResponse;
            
            // Add AI response to history
            conversationHistory.push({ role: 'assistant', content: aiResponse });

        } catch (error) {
            console.error("Error executing prompt:", error);
            outputDiv.innerHTML = `<div style="color: red; font-weight: bold;">An error occurred while communicating with the AI. Please check the console for details.</div>`;
        } finally {
            setOutputLoading(false);
        }
    };
    
    const showInitialMessage = async () => {
         const initialPrompt = `Hello! Introduce yourself. Your name is Aether. Explain that you are an AI-oriented programming language that generates HTML content based on natural language. Keep it brief and welcoming.`;
         await executePrompt(initialPrompt);
    };

    runButton.addEventListener('click', () => {
        const userPrompt = promptInput.value.trim();
        if (userPrompt) {
            executePrompt(userPrompt);
        }
    });
    
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
             runButton.click();
        }
    });

    createLoader();
    showInitialMessage();
});

