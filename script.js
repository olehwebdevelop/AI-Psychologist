const welcomeInput=document.getElementById("welcome-input");
const chatInput=document.getElementById("text-field");
const welcomeScreen=document.getElementById("welcome-screen");
const chatScreen=document.getElementById("chat-screen");
const messagesContainer=document.getElementById("messages");
const newChatBtn=document.getElementById("new-chat");
const chatHistory=document.getElementById("chat-history");
const deleteModal=document.getElementById("delete-modal");
const confirmDeleteBtn=document.getElementById("confirm-delete");
const cancelDeleteBtn=document.getElementById("cancel-delete");

const systemPrompt="You are a professional AI Psychologist. Be empathetic, support the user, listen carefully. Keep responses concise. ALWAYS respond in the exact same language used by the user.";

let chats=JSON.parse(localStorage.getItem("ai_chats"))||[];
let currentChatId=null;
let chatToDelete=null;

function saveChats(){
    localStorage.setItem("ai_chats",JSON.stringify(chats));
}

function createNewChat(){
    const newChat={
        id:Date.now(),
        title:"New Chat",
        messages:[]
    };

    chats.unshift(newChat);
    currentChatId=newChat.id;

    saveChats();
    renderChatHistory();
    openChat(newChat.id);
}

function renderChatHistory(){
    chatHistory.innerHTML="";

    chats.forEach(chat=>{
        const div=document.createElement("div");
        div.className="chat-item";

        if(chat.id===currentChatId){
            div.classList.add("active");
        }

        const title=document.createElement("div");
        title.className="chat-title";
        title.textContent=chat.title;

        title.onclick=()=>{
            openChat(chat.id);
        };

        const deleteBtn=document.createElement("button");
        deleteBtn.className="delete-chat";
        deleteBtn.innerHTML="✕";

        deleteBtn.onclick=(e)=>{
            e.stopPropagation();
            chatToDelete=chat.id;
            deleteModal.classList.remove("hidden");
        };

        div.appendChild(title);
        div.appendChild(deleteBtn);

        chatHistory.appendChild(div);
    });
}

function openChat(chatId){
    currentChatId=chatId;

    const chat=chats.find(c=>c.id===chatId);

    messagesContainer.innerHTML="";

    if(chat.messages.length>0){
        chatScreen.classList.add("active");
        welcomeScreen.classList.add("hidden");

        chat.messages.forEach(msg=>{
            addMessage(msg.text,msg.sender,false);
        });
    }else{
        chatScreen.classList.remove("active");
        welcomeScreen.classList.remove("hidden");
    }

    renderChatHistory();
}

function addMessage(text,sender="user",save=true){
    const div=document.createElement("div");

    div.classList.add("message");
    div.classList.add(sender);

    div.textContent=text;

    messagesContainer.appendChild(div);

    messagesContainer.scrollTop=messagesContainer.scrollHeight;

    if(save){
        const chat=chats.find(c=>c.id===currentChatId);

        if(!chat)return;

        chat.messages.push({
            text,
            sender
        });

        if(chat.title==="New Chat"&&sender==="user"){
            chat.title=text.slice(0,25);
        }

        saveChats();
        renderChatHistory();
    }
}

function showTypingIndicator(){
    if(document.getElementById("typing-loader"))return;

    const indicator=document.createElement("div");

    indicator.className="typing-indicator";
    indicator.id="typing-loader";

    indicator.innerHTML=`<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;

    messagesContainer.appendChild(indicator);

    messagesContainer.scrollTop=messagesContainer.scrollHeight;
}

function removeTypingIndicator(){
    const indicator=document.getElementById("typing-loader");

    if(indicator){
        indicator.remove();
    }
}

async function askHuggingFaceAI(userMessage){
    showTypingIndicator();

    const apiUrl="https://text.pollinations.ai/";

    try{
        const response=await fetch(apiUrl,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                messages:[
                    {
                        role:"system",
                        content:systemPrompt
                    },
                    {
                        role:"user",
                        content:userMessage
                    }
                ],
                model:"openai",
                jsonMode:false
            })
        });

        removeTypingIndicator();

        if(!response.ok){
            addMessage("Connection lost.","bot");
            return;
        }

        const replyText=await response.text();

        if(replyText&&replyText.trim()){
            addMessage(replyText.trim(),"bot");
        }else{
            addMessage("Empty AI response.","bot");
        }

    }catch(error){
        removeTypingIndicator();
        console.error(error);
        addMessage("Connection error.","bot");
    }
}

function handleUserMessage(text){
    if(!currentChatId){
        createNewChat();
    }

    chatScreen.classList.add("active");
    welcomeScreen.classList.add("hidden");

    addMessage(text,"user");

    askHuggingFaceAI(text);
}

welcomeInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&welcomeInput.value.trim()){
        const text=welcomeInput.value;

        welcomeInput.value="";

        handleUserMessage(text);

        chatInput.focus();
    }
});

chatInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&chatInput.value.trim()){
        const text=chatInput.value;

        chatInput.value="";

        handleUserMessage(text);
    }
});

newChatBtn.addEventListener("click",()=>{
    createNewChat();
});

confirmDeleteBtn.onclick=()=>{
    chats=chats.filter(c=>c.id!==chatToDelete);

    saveChats();

    deleteModal.classList.add("hidden");

    if(currentChatId===chatToDelete){
        messagesContainer.innerHTML="";
        currentChatId=null;

        if(chats.length>0){
            openChat(chats[0].id);
        }else{
            chatScreen.classList.remove("active");
            welcomeScreen.classList.remove("hidden");
        }
    }

    renderChatHistory();
};

cancelDeleteBtn.onclick=()=>{
    deleteModal.classList.add("hidden");
    chatToDelete=null;
};

deleteModal.onclick=e=>{
    if(e.target===deleteModal){
        deleteModal.classList.add("hidden");
    }
};

if(chats.length>0){
    openChat(chats[0].id);
}

const menuToggleElement = document.getElementById("menu-toggle");
const navBarElement = document.querySelector(".nav-bar");
const overlayElement = document.getElementById("sidebar-overlay");

function closeSidebarFn() {
    if (navBarElement) navBarElement.classList.remove("open");
    if (overlayElement) overlayElement.classList.remove("active");
    
    setTimeout(() => {
        if (navBarElement && !navBarElement.classList.contains("open")) {
            if (menuToggleElement) menuToggleElement.classList.remove("hidden");
        }
    }, 280);
}


if (menuToggleElement) {
    menuToggleElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (navBarElement) navBarElement.classList.add("open");
        if (overlayElement) overlayElement.classList.add("active");
        menuToggleElement.classList.add("hidden");
    });
}

document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "close-sidebar") {
        closeSidebarFn();
        return;
    }

    if (e.target && e.target.id === "sidebar-overlay") {
        closeSidebarFn();
        return;
    }

    if (navBarElement && navBarElement.classList.contains("open")) {
        if (!navBarElement.contains(e.target) && e.target !== menuToggleElement) {
            closeSidebarFn();
        }
    }
});

