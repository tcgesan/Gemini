// Select DOM elements
const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
let userMessage = null;

// API Configuration for OpenAI
const API_KEY = "sk-h58Giq87TYmTHljEJa2L4mWlHeCAbveRTxT3JxxuOYT3BlbkFJr1ue2Vb88rnkBXlcBk6UQCGh7GHAUWyBvD9NztZIIA"; // Replace with your actual OpenAI API key
const API_URL = "https://api.openai.com/v1/chat/completions";

// Load chat history and theme from localStorage
const loadLocalstorageData = () => {
   const savedChats = localStorage.getItem("savedChats");
   const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

   document.body.classList.toggle("light_mode", isLightMode);
   toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

   chatList.innerHTML = savedChats || "";
   chatList.scrollTo(0, chatList.scrollHeight);
}

loadLocalstorageData();

// Create a new message element and return it 
const createMessageElement = (content, ...classes) => {
   const div = document.createElement("div");
   div.classList.add("message", ...classes);
   div.innerHTML = content;
   return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
   const words = text.split(" ");
   let currentWordIndex = 0;

   const typingInterval = setInterval(() => {
      textElement.innerText += " " + words[currentWordIndex++];
      if (currentWordIndex === words.length) {
         clearInterval(typingInterval);
         localStorage.setItem("savedChats", chatList.innerHTML);
      }
      chatList.scrollTo(0, chatList.scrollHeight);
   }, 90);
}

// Generate response from OpenAI API
const generateAPIResponse = async (incomingMessageDiv) => {
   const textElement = incomingMessageDiv.querySelector(".text");

   try{
    const response = await fetch(API_URL, {
       method: "POST",
       headers:{"Content-Type": "application/json"},
       body: JSON.stringify({
          contents:[{
             role: "user",
             parts: [{text: userMessage}]
          }]
       })
    });

      const data = await response.json();
      const apiResponse = data.choices[0].message.content;
      showTypingEffect(apiResponse, textElement, incomingMessageDiv);
   } catch (error) {
      console.log(error);
   } finally {
      incomingMessageDiv.classList.remove("loading");
   }
}

// Show loading animation and handle API response
const showLoadingAnimation = () => {
   const html = `
      <div class="message-content">
         <img src="openai-logo.png" alt="OpenAI" class="avatar">
         <p class="text"></p>
         <div class="loading-indicator">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
         </div>
      </div>`;

   const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
   chatList.appendChild(incomingMessageDiv);
   chatList.scrollTo(0, chatList.scrollHeight);
   generateAPIResponse(incomingMessageDiv);
}

// Handle sending outgoing chat message
const handleOutgoingChat = () => {
   userMessage = typingForm.querySelector(".typing-input").value.trim();
   if (!userMessage) return;

   const html = `
      <div class="message-content">
         <img src="user-icon.png" alt="User" class="avatar">
         <p class="text">${userMessage}</p>
      </div>`;

   const outgoingMessageDiv = createMessageElement(html, "outgoing");
   chatList.appendChild(outgoingMessageDiv);
   typingForm.reset(); // Clear input field
   chatList.scrollTo(0, chatList.scrollHeight); // Scroll to bottom

   // Show loading animation
   setTimeout(showLoadingAnimation, 500);
}

// Toggle theme (light/dark mode)
toggleThemeButton.addEventListener("click", () => {
   const isLightMode = document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
   toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chat history
deleteChatButton.addEventListener("click", () => {
   if (confirm("Are you sure you want to delete all chats?")) {
      localStorage.removeItem("savedChats");
      chatList.innerHTML = "";
   }
});

// Prevent form submission and handle chat
typingForm.addEventListener("submit", (e) => {
   e.preventDefault();
   handleOutgoingChat();
});