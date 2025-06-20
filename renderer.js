const { createApp, ref, nextTick, onMounted, watch, computed } = Vue;

createApp({
  setup() {
    const chatHistory = ref([]);
    const newMessage = ref("");
    const pastedFiles = ref([]);
    const settings = ref({
      apiKey: '',
      modelName: '',
      systemPrompt: '',
      rootDir: '',
      sofficePath: '',
      providerOrder: ''
    });
    const showSettings = ref(false);
    const isTyping = ref(false);
    const chatContainer = ref(null);

    const getMessageClass = (message) => {
      if (message.is_file_viewer) {
        return 'file-viewer-message';
      }
      return `${message.role}-message`;
    };

    onMounted(async () => {
      // Load settings
      const loadedSettings = await window.electronAPI.getSettings();
      Object.assign(settings.value, loadedSettings);

      // Set up event listeners
      window.electronAPI.onDebugLog((payload) => {
        console.log(`[MAIN PROCESS] ${payload.type}:`, payload.data);
      });

      // Listen for incremental history updates
      window.electronAPI.onUpdateHistory((updatedHistory) => {
        chatHistory.value = updatedHistory;
        scrollToBottom();
      });

      // Focus on message input
      await nextTick();
      const messageInput = document.getElementById("message-input");
      if (messageInput) {
        messageInput.focus();
      }

      // Handle file paste
      window.addEventListener("paste", (event) => {
        const files = event.clipboardData.files;
        if (files.length > 0) {
          pastedFiles.value = [...pastedFiles.value, ...Array.from(files)];
          event.preventDefault();
        }
      });

      // Handle external link clicks
      window.addEventListener("click", async (event) => {
        if (event.target.tagName === "A" && event.target.href) {
          const url = event.target.href;
          // Check if it's an external URL (http/https)
          if (url.startsWith("http://") || url.startsWith("https://")) {
            event.preventDefault();
            try {
              await window.electronAPI.openExternalUrl(url);
            } catch (error) {
              console.error("Failed to open external URL:", error);
            }
          }
        }
      });

      window.addEventListener("keydown", (event) => {
        if ((event.ctrlKey && event.key === "l") || (event.altKey && event.key === "d")) {
          event.preventDefault();
          const pathInput = document.getElementById("path-input");
          if (pathInput) {
            pathInput.focus();
          }
        }
      });
    });

    watch(settings, (newSettings) => {
      // Convert Proxy to plain object for IPC
      const plainSettings = JSON.parse(JSON.stringify(newSettings));
      window.electronAPI.setSettings(plainSettings);
    }, { deep: true });

    const adjustTextareaHeight = (event) => {
      const textarea = event.target;

      // If empty or very short content, use default height
      if (!textarea.value || textarea.value.length < 30) {
        textarea.style.height = "40px";
        return;
      }

      // Reset to default height to get accurate scrollHeight
      textarea.style.height = "40px";

      // If content requires more height, expand
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = textarea.scrollHeight + "px";
      }
    };
    const sendMessage = async () => {
      if (!newMessage.value.trim() && pastedFiles.value.length === 0) return;

      try {
        // Build user message content
        const userMessageContent = await buildUserMessageContent(
          newMessage.value.trim(),
          pastedFiles.value
        );

        // Add user message to history
        chatHistory.value.push({ role: "user", content: userMessageContent });

        // Clear inputs
        newMessage.value = "";
        pastedFiles.value = [];

        // Reset UI
        await resetMessageInput();
        isTyping.value = true;
        scrollToBottom();

        // Send to main process
        const plainMessages = JSON.parse(JSON.stringify(chatHistory.value));
        const response = await window.electronAPI.sendMessage({
          messages: plainMessages
        });

        isTyping.value = false;

        // Final update with complete history
        if (response) {
          chatHistory.value = response;
          scrollToBottom();
        }
      } catch (error) {
        handleSendError(error);
      }
    };

    // Helper function to build user message content
    const buildUserMessageContent = async (text, files) => {
      const content = [];

      // Add text if available
      if (text) {
        content.push({ type: "text", text });
      }

      // Process files
      const fileContents = await processFiles(files);
      content.push(...fileContents);

      return content;
    };

    // Helper function to process files
    const processFiles = async (files) => {
      const filePromises = files.map(file => processFile(file));
      const results = await Promise.all(await Promise.all(filePromises));
      return results.filter(content => content !== null);
    };

    // Helper function to process a single file
    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          console.error(`Failed to read file: ${file.name}`);
          reject(new Error(`Failed to read file: ${file.name}`));
        };

        reader.onload = async (e) => {
          try {
            const fileBuffer = e.target.result;
            const result = await window.electronAPI.processAttachment({
              fileBuffer,
              fileName: file.name
            });

            // Format the result for the message content
            if (result.type === 'image') {
              resolve({
                type: 'image_url',
                image_url: { url: `data:${result.mime};base64,${result.content}` },
              });
            } else if (result.type === 'pdf') {
              resolve({
                type: 'file',
                file: { filename: result.filename, file_data: `data:${result.mime};base64,${result.content}` },
              });
            } else if (result.type === 'text') {
              const prefix = result.isSpreadsheet ? 'File Content (from spreadsheet):\n' : `Content of "${result.filename}":\n\n`;
              resolve({
                type: 'text',
                text: `${prefix}${result.content}`,
                isAttachment: true,
              });
            } else {
              console.warn(`Unsupported file type processed: ${result.type}`);
              resolve(null);
            }
          } catch (error) {
            console.error(`Failed to process file: ${file.name}`, error);
            handleSendError(error);
            resolve(null);
          }
        };

        reader.readAsArrayBuffer(file);
      });
    };

    // Helper function to reset message input
    const resetMessageInput = async () => {
      await nextTick();
      const textarea = document.getElementById("message-input");
      if (textarea) {
        textarea.style.height = "40px";
      }
    };

    // Helper function to handle send errors
    const handleSendError = (error) => {
      isTyping.value = false;
      console.error("Error sending message:", error);
      chatHistory.value.push({
        role: "assistant",
        content: `Sorry, there was an error: ${error.message}`,
      });
      scrollToBottom();
    };

    const renderMarkdown = (content) => {
      if (typeof content !== 'string') return '';
      return marked.parse(content);
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    };

    const restartSession = () => {
      chatHistory.value = [];
      pastedFiles.value = [];
    };

    const removeFile = (index) => {
      pastedFiles.value.splice(index, 1);
    };

    return {
      chatHistory,
      newMessage,
      settings,
      showSettings,
      isTyping,
      chatContainer,
      adjustTextareaHeight,
      sendMessage,
      restartSession,
      pastedFiles,
      removeFile,
      renderMarkdown,
      getMessageClass,
    };
  },
}).mount("#app");
