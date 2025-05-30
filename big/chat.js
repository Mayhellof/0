// chat.js
window.messages = {
  "默认群": [],
  "朋友群": [],
  "工作群": []
};

window.onlineUsers = {
  "默认群": ["你"],
  "朋友群": ["小明", "小红"],
  "工作群": ["张经理", "李组长"]
};

let currentGroup = "默认群";
let ws;

function connectWebSocket() {
  const wsUrl = "ws://localhost:3000"; // 修复地址格式
  ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("已连接到服务器");

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "new_message") {
        if (!messages[message.group]) messages[message.group] = [];
        messages[message.group].push(message.payload);
        if (message.group === currentGroup) renderMessages();
      } else if (message.type === "retract_message") {
        if (messages[message.group] && messages[message.group][message.index]) {
          messages[message.group].splice(message.index, 1);
          if (message.group === currentGroup) renderMessages();
        }
      }
    } catch (e) {
      console.error("解析消息失败", e);
    }
  };

  ws.onerror = (err) => console.error("WebSocket 错误:", err);
}

connectWebSocket();

function switchGroup(groupName) {
  currentGroup = groupName;
  document.getElementById("currentGroupTitle").textContent = `当前群：${groupName}`;
  renderMessages();
  updateOnlineUsers();
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  const msg = {
    group: currentGroup,
    payload: {
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoTimestamp: new Date().toISOString()
    }
  };

  ws.send(JSON.stringify({ type: "new_message", ...msg }));
  input.value = "";
  renderMessages();
}

function renderMessages() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";

  let lastTime = null;

  messages[currentGroup].forEach((msg, index) => {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${msg.sender === "user" ? "user2" : "user1"}`;

    const displayTime = msg.timestamp || new Date(msg.isoTimestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    let contentHTML = `<strong>${msg.sender === "user" ? "你" : "对方"}:</strong>`;
    contentHTML += `<div class="message-content">${marked.parse(msg.text)}</div>`;

    if (!lastTime || displayTime !== lastTime) {
      contentHTML += `<small class="message-time">${displayTime}</small>`;
      lastTime = displayTime;
    }

    bubble.innerHTML = contentHTML;
    chatBox.appendChild(bubble);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

function addGroup() {
  const input = document.getElementById("groupNameInput");
  const groupList = document.getElementById("groupList");

  const groupName = input.value.trim();
  if (!groupName || messages[groupName]) return;

  messages[groupName] = [];
  const li = document.createElement("li");
  li.textContent = groupName;
  li.onclick = () => switchGroup(groupName);
  groupList.appendChild(li);
  input.value = "";
  switchGroup(groupName);
}

document.getElementById("imageInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const imageMsg = {
        group: currentGroup,
        payload: {
          sender: "user",
          image: event.target.result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isoTimestamp: new Date().toISOString()
        }
      };
      messages[currentGroup].push(imageMsg.payload);
      ws.send(JSON.stringify({ type: "new_message", ...imageMsg }));
      renderMessages();
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("messageInput")?.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 黑夜模式切换
document.getElementById("toggleDarkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const icon = document.getElementById("darkModeIcon");
  const text = document.getElementById("darkModeText");
  if (document.body.classList.contains("dark-mode")) {
    icon.textContent = "☀️";
    text.textContent = "关闭黑夜模式";
  } else {
    icon.textContent = "🌙";
    text.textContent = "开启黑夜模式";
  }
});

function updateOnlineUsers() {
  const userListEl = document.getElementById("userList");
  userListEl.innerHTML = "";
  onlineUsers[currentGroup]?.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    userListEl.appendChild(li);
  });
}