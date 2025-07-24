// Variabel Global (API_BASE_URL, PUSHER_APP_KEY, PUSHER_CLUSTER akan diambil dari window.frontendConfig)
let loggedInUser = null;
let currentChatPartner = null;
let pusher = null;
let currentChatChannel = null;
let allUsers = []; // Menyimpan daftar semua pengguna untuk daftar kontak

// Elemen DOM
const appContainer = document.getElementById("app-container");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterLink = document.getElementById("showRegisterLink");
const showLoginLink = document.getElementById("showLoginLink");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginSubmitButton = document.getElementById("loginSubmit");
const registerNameInput = document.getElementById("registerName");
const registerPhoneNumberInput = document.getElementById("registerPhoneNumber");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const registerSubmitButton = document.getElementById("registerSubmit");
const authMessage = document.getElementById("authMessage");

const loggedInUserNameDisplay = document.getElementById("loggedInUserName");
const contactList = document.getElementById("contactList");
const chatHeader = document.getElementById("chatHeader"); // Perbaikan: Hapus penugasan ganda
const chatPartnerNameDisplay = document.getElementById("chatPartnerName");
const chatMessagesContainer = document.getElementById("chatMessages");
const messageInputArea = document.getElementById("messageInputArea");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessageButton");
const noChatSelectedMessage = document.getElementById("noChatSelectedMessage");

const profileButton = document.getElementById("profileButton");
const profileModal = document.getElementById("profileModal");
const displayUserName = document.getElementById("displayUserName");
const displayUserEmail = document.getElementById("displayUserEmail");
const displayUserPhone = document.getElementById("displayUserPhone");
const editUserNameInput = document.getElementById("editUserNameInput");
const updateNameButton = document.getElementById("updateNameButton");
const profileMessage = document.getElementById("profileMessage");

const newChatButton = document.getElementById("newChatButton");
const newChatModal = document.getElementById("newChatModal");
const newChatPhoneNumberInput = document.getElementById("newChatPhoneNumber");
const findUserButton = document.getElementById("findUserButton");
const foundUserDisplay = document.getElementById("foundUserDisplay");
const foundUserName = document.getElementById("foundUserName");
const foundUserEmail = document.getElementById("foundUserEmail");
const startChatWithFoundUserButton = document.getElementById(
  "startChatWithFoundUserButton"
);
const newChatMessage = document.getElementById("newChatMessage");

const logoutButton = document.getElementById("logoutButton");

const messageBox = document.getElementById("messageBox");
const messageBoxContent = document.getElementById("messageBoxContent");

// --- Tambahan: Elemen untuk Modal Konfirmasi Logout ---
const logoutConfirmModal = document.createElement("div");
logoutConfirmModal.id = "logoutConfirmModal";
logoutConfirmModal.className = "modal";
logoutConfirmModal.innerHTML = `
    <div class="modal-content text-center">
        <h2 class="text-2xl font-bold text-teal-600 mb-4">Konfirmasi Logout</h2>
        <p class="text-lg text-gray-700 mb-6">Apakah Anda yakin ingin keluar?</p>
        <div class="flex justify-center space-x-4">
            <button id="confirmLogoutYes" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 ease-in-out transform hover:scale-105 shadow-md">Ya</button>
            <button id="confirmLogoutNo" class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out transform hover:scale-105 shadow-md">Tidak</button>
        </div>
    </div>
`;
document.body.appendChild(logoutConfirmModal);

const confirmLogoutYesButton = document.getElementById("confirmLogoutYes");
const confirmLogoutNoButton = document.getElementById("confirmLogoutNo");
// --- Akhir Tambahan Modal Konfirmasi Logout ---

// --- Fungsi Utilitas ---

// Menampilkan pesan di kotak pesan kustom
function showMessageBox(message, type = "info") {
  messageBoxContent.textContent = message;
  messageBox.classList.remove(
    "hidden",
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500"
  );
  if (type === "error") {
    messageBox.classList.add("bg-red-500");
  } else if (type === "success") {
    messageBox.classList.add("bg-green-500");
  } else {
    messageBox.classList.add("bg-blue-500");
  }
  messageBox.classList.add("animate-fadeInUp"); // Optional: Add animation class
  setTimeout(() => {
    messageBox.classList.add("hidden");
    messageBox.classList.remove("animate-fadeInUp");
  }, 3000); // Hide after 3 seconds
}

// Fungsi untuk menampilkan/menyembunyikan modal
function showModal(modalElement) {
  modalElement.style.display = "flex";
}

function hideModal(modalElement) {
  modalElement.style.display = "none";
}

// --- Autentikasi ---

function showLoginRegister() {
  hideModal(profileModal);
  hideModal(newChatModal);
  hideModal(logoutConfirmModal); // Pastikan modal konfirmasi juga tersembunyi
  appContainer.classList.add("hidden");
  showModal(authModal);
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  authMessage.textContent = "";
}

function showMainApp() {
  hideModal(authModal);
  hideModal(logoutConfirmModal); // Pastikan modal konfirmasi juga tersembunyi
  appContainer.classList.remove("hidden");
}

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  authMessage.textContent = "";
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  authMessage.textContent = "";
});

loginSubmitButton.addEventListener("click", async () => {
  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;
  authMessage.textContent = "Memproses...";
  authMessage.className = "mt-4 text-sm font-medium text-blue-600";

  try {
    const response = await fetch(
      `${window.frontendConfig.API_BASE_URL}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loggedInUser = data.data;
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
      authMessage.textContent = data.message;
      authMessage.className = "mt-4 text-sm font-medium text-green-600";
      setTimeout(initChatApp, 1000);
    } else {
      authMessage.textContent = data.message;
      authMessage.className = "mt-4 text-sm font-medium text-red-600";
    }
  } catch (error) {
    console.error("Error during login:", error);
    authMessage.textContent = "Terjadi kesalahan saat login.";
    authMessage.className = "mt-4 text-sm font-medium text-red-600";
  }
});

registerSubmitButton.addEventListener("click", async () => {
  const name = registerNameInput.value;
  const phone_number = registerPhoneNumberInput.value;
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;
  authMessage.textContent = "Memproses...";
  authMessage.className = "mt-4 text-sm font-medium text-blue-600";

  try {
    const response = await fetch(
      `${window.frontendConfig.API_BASE_URL}/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone_number, email, password }),
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      authMessage.textContent = data.message + ". Silakan login.";
      authMessage.className = "mt-4 text-sm font-medium text-green-600";
      // Clear register form and show login form
      registerNameInput.value = "";
      registerPhoneNumberInput.value = "";
      registerEmailInput.value = "";
      registerPasswordInput.value = "";
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      authMessage.textContent = data.message;
      authMessage.className = "mt-4 text-sm font-medium text-red-600";
    }
  } catch (error) {
    console.error("Error during registration:", error);
    authMessage.textContent = "Terjadi kesalahan saat pendaftaran.";
    authMessage.className = "mt-4 text-sm font-medium text-red-600";
  }
});

// --- Perubahan di Sini: Konfirmasi Logout ---
logoutButton.addEventListener("click", () => {
  showModal(logoutConfirmModal); // Tampilkan modal konfirmasi
});

confirmLogoutYesButton.addEventListener("click", () => {
  // Lanjutkan dengan proses logout
  localStorage.removeItem("loggedInUser");
  loggedInUser = null;
  currentChatPartner = null;
  if (pusher) {
    pusher.disconnect();
    pusher = null;
  }
  chatMessagesContainer.innerHTML = `<div class="text-center text-gray-500 mt-4" id="noChatSelectedMessage">
        <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
        <p class="text-lg">Mulai percakapan dengan memilih kontak atau membuat chat baru.</p>
    </div>`;
  chatPartnerNameDisplay.textContent = "Pilih kontak untuk memulai chat";
  messageInputArea.classList.add("hidden");
  showLoginRegister(); // Kembali ke tampilan login/register
  showMessageBox("Anda telah berhasil logout.", "info");
});

confirmLogoutNoButton.addEventListener("click", () => {
  hideModal(logoutConfirmModal); // Sembunyikan modal konfirmasi
});
// --- Akhir Perubahan Konfirmasi Logout ---

// --- Inisialisasi Aplikasi Chat ---

async function initChatApp() {
  const storedUser = localStorage.getItem("loggedInUser");
  if (storedUser) {
    loggedInUser = JSON.parse(storedUser);
    showMainApp();
    loggedInUserNameDisplay.textContent = loggedInUser.name;
    await fetchAllUsers();
    initPusher();
  } else {
    showLoginRegister();
  }
}

// Mengambil semua pengguna untuk daftar kontak
async function fetchAllUsers() {
  try {
    const response = await fetch(`${window.frontendConfig.API_BASE_URL}/users`);
    const data = await response.json();
    if (data.status === "success") {
      allUsers = data.data.users.filter(
        (user) => user.id !== loggedInUser.userId
      ); // Filter out self
      renderContactList();
    } else {
      console.error("Failed to fetch all users:", data.message);
      showMessageBox("Gagal memuat daftar kontak.", "error");
    }
  } catch (error) {
    console.error("Error fetching all users:", error);
    showMessageBox("Terjadi kesalahan saat memuat kontak.", "error");
  }
}

// Render daftar kontak di panel kiri
function renderContactList() {
  contactList.innerHTML = "";
  if (allUsers.length === 0) {
    contactList.innerHTML = `<div class="p-4 text-gray-500 text-center">Tidak ada kontak yang tersedia.</div>`;
    return;
  }

  allUsers.forEach((user) => {
    const contactItem = document.createElement("div");
    contactItem.className =
      "flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out";
    contactItem.innerHTML = `
            <i class="fas fa-user-circle text-4xl text-gray-400 mr-4"></i>
            <div>
                <p class="font-semibold text-gray-800 text-lg">${user.name}</p>
                <p class="text-sm text-gray-500">${user.phone_number}</p>
            </div>
        `;
    contactItem.addEventListener("click", () => selectChatPartner(user));
    contactList.appendChild(contactItem);
  });
}

// --- Logika Chat ---

async function selectChatPartner(partner) {
  currentChatPartner = partner;
  chatPartnerNameDisplay.textContent = partner.name;
  messageInputArea.classList.remove("hidden");
  noChatSelectedMessage.classList.add("hidden");
  chatMessagesContainer.innerHTML = ""; // Clear previous messages

  await fetchMessages(partner.id);
  subscribeToChatChannel(loggedInUser.userId, partner.id);
  // Perbaikan: Gulir ke bawah setelah memilih kontak dan memuat pesan
  // Penundaan kecil untuk memastikan DOM sudah dirender
  setTimeout(() => {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }, 50); // Delay 50ms
}

async function fetchMessages(receiverId, limit = 20, offset = 0) {
  try {
    const response = await fetch(
      `${window.frontendConfig.API_BASE_URL}/messages/${loggedInUser.userId}/${receiverId}?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    if (data.status === "success") {
      // Backend mengembalikan pesan dalam urutan DESC (terbaru di atas).
      // Untuk menampilkan pesan terbaru di bagian bawah dengan flex-col (normal),
      // kita perlu membalik urutan pesan agar yang paling lama ditambahkan pertama.
      const messages = data.data.messages.reverse(); // Membalik agar pesan terlama di awal array
      messages.forEach((msg) => appendMessageToChat(msg)); // Tambahkan pesan satu per satu (akan appendChild)
      // Gulir ke bawah setelah semua pesan historis ditambahkan dan dirender
      setTimeout(() => {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }, 50); // Delay 50ms
    } else {
      console.error("Failed to fetch messages:", data.message);
      showMessageBox("Gagal memuat pesan.", "error");
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    showMessageBox("Terjadi kesalahan saat memuat pesan.", "error");
  }
}

function appendMessageToChat(message) {
  const messageElement = document.createElement("div");
  const isSender = message.senderId === loggedInUser.userId;

  let timestampText = "";
  try {
    const messageDate = new Date(message.created_at);
    if (!isNaN(messageDate.getTime())) {
      // Check if date is valid
      timestampText = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Fallback jika tanggal tidak valid dari backend, tampilkan waktu saat ini
      const fallbackDate = new Date(); // Gunakan waktu saat ini di frontend
      timestampText = fallbackDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      console.error(
        "Frontend: Invalid date received for message.created_at (using current time as fallback):",
        message.created_at
      );
    }
  } catch (e) {
    // Tangani error parsing, gunakan waktu saat ini sebagai fallback
    const fallbackDate = new Date();
    timestampText = fallbackDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    console.error(
      "Frontend: Error parsing date for message.created_at (using current time as fallback):",
      message.created_at,
      e
    );
  }

  messageElement.className = `flex mb-2 ${
    isSender ? "justify-end" : "justify-start"
  }`;
  messageElement.setAttribute("data-message-id", message.id);
  // Add a class for optimistic messages if applicable
  if (message.isOptimistic) {
    messageElement.classList.add("optimistic-pending");
  }

  // Perbaikan: Struktur HTML untuk bubble chat agar lebih rapi
  messageElement.innerHTML = `
        <div class="flex flex-col relative max-w-[70%] p-3 rounded-xl shadow-md ${
          isSender
            ? "bg-teal-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-bl-none"
        }">
            <p class="text-sm break-words">${message.content}</p>
            <span class="text-xs opacity-75 mt-1 ${
              isSender ? "text-white self-end" : "text-gray-600 self-start"
            }">${timestampText}</span>
        </div>
    `;

  chatMessagesContainer.appendChild(messageElement);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Gulir ke bawah pada pesan baru
}

sendMessageButton.addEventListener("click", async () => {
  const content = messageInput.value.trim();
  if (!content || !loggedInUser || !currentChatPartner) {
    showMessageBox(
      "Pesan tidak boleh kosong atau kontak belum dipilih.",
      "info"
    );
    return;
  }

  // --- Pembaruan Optimis: Tambahkan pesan ke UI segera ---
  const now = new Date();
  const tempMessageId = `temp-${now.getTime()}`; // ID sementara yang unik
  const optimisticMessage = {
    id: tempMessageId,
    senderId: loggedInUser.userId,
    receiverId: currentChatPartner.id,
    content: content,
    created_at: now.toISOString(), // Client-side timestamp for optimistic display
    isOptimistic: true, // Tandai sebagai pesan optimis
  };
  appendMessageToChat(optimisticMessage);
  messageInput.value = ""; // Kosongkan input segera

  try {
    const response = await fetch(
      `${window.frontendConfig.API_BASE_URL}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: loggedInUser.userId,
          receiverId: currentChatPartner.id,
          content: content,
        }),
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      // Temukan pesan optimis dan perbarui ID serta timestamp-nya
      const optimisticElement = document.querySelector(
        `[data-message-id="${tempMessageId}"]`
      );
      if (optimisticElement) {
        // Perbarui data-message-id ke ID asli dari backend
        optimisticElement.setAttribute("data-message-id", data.data.messageId);
        // Hapus kelas optimistic-pending
        optimisticElement.classList.remove("optimistic-pending");

        // Perbarui tampilan timestamp dengan timestamp asli dari backend
        const realMessageDate = new Date(data.data.createdAt);
        if (!isNaN(realMessageDate.getTime())) {
          const realTimestampText = realMessageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          optimisticElement.querySelector("span").textContent =
            realTimestampText;
        } else {
          optimisticElement.querySelector("span").textContent = "Invalid Date";
          console.warn(
            "Frontend: Tanggal tidak valid diterima dari backend untuk messageId:",
            data.data.messageId,
            data.data.createdAt
          );
        }
      }
    } else {
      // Jika API gagal, hapus pesan optimis
      const optimisticElement = document.querySelector(
        `[data-message-id="${tempMessageId}"]`
      );
      if (optimisticElement) {
        optimisticElement.remove();
      }
      showMessageBox("Gagal mengirim pesan: " + data.message, "error");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    // Jika terjadi error jaringan, hapus pesan optimis
    const optimisticElement = document.querySelector(
      `[data-message-id="${tempMessageId}"]`
    );
    if (optimisticElement) {
      optimisticElement.remove();
    }
    showMessageBox("Terjadi kesalahan saat mengirim pesan.", "error");
  }
});

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessageButton.click();
  }
});

// --- Pusher Real-time ---

function initPusher() {
  if (pusher) {
    pusher.disconnect(); // Putuskan koneksi Pusher yang ada jika ada
  }
  pusher = new Pusher(window.frontendConfig.PUSHER_APP_KEY, {
    cluster: window.frontendConfig.PUSHER_CLUSTER,
    authEndpoint: `${window.frontendConfig.API_BASE_URL}/pusher/auth`,
    auth: {
      params: {
        userId: loggedInUser.userId,
      },
    },
  });

  pusher.connection.bind("connected", () => {
    console.log("Pusher connected!");
  });
  pusher.connection.bind("error", (err) => {
    console.error("Pusher connection error:", err);
    showMessageBox(
      "Koneksi real-time terputus. Coba refresh halaman.",
      "error"
    );
  });
}

function subscribeToChatChannel(user1Id, user2Id) {
  // Perbaikan: Gunakan underscore untuk menggabungkan ID agar tidak terpecah oleh UUID
  const sortedIds = [user1Id, user2Id].sort().join("_");
  const channelName = `private-chat-${sortedIds}`;

  if (currentChatChannel && currentChatChannel.name === channelName) {
    console.log(`Sudah berlangganan ke ${channelName}`);
    return;
  }

  if (currentChatChannel) {
    pusher.unsubscribe(currentChatChannel.name);
    console.log(`Berhenti berlangganan dari ${currentChatChannel.name}`);
  }

  currentChatChannel = pusher.subscribe(channelName);
  console.log(`Berlangganan ke ${channelName}`);

  currentChatChannel.bind("new-message", (data) => {
    console.log("Pesan baru diterima via Pusher:", data);
    // Hanya tambahkan jika pesan untuk chat yang sedang aktif
    if (
      (data.senderId === loggedInUser.userId &&
        data.receiverId === currentChatPartner.id) ||
      (data.senderId === currentChatPartner.id &&
        data.receiverId === loggedInUser.userId)
    ) {
      // Untuk pengirim, abaikan pesan Pusher karena UI sudah diupdate via API response
      if (data.senderId === loggedInUser.userId) {
        console.log(
          "Pesan dari pengirim sendiri, diabaikan oleh Pusher listener karena UI sudah diupdate via API response."
        );
        return;
      }

      // Untuk pesan dari pengguna lain (penerima), tambahkan saja
      appendMessageToChat(data);
    } else {
      console.log("Pesan diterima tetapi bukan untuk chat aktif ini.");
    }
  });

  currentChatChannel.bind("pusher:subscription_succeeded", () => {
    console.log(`Berhasil berlangganan ke ${channelName}`);
  });

  currentChatChannel.bind("pusher:subscription_error", (status) => {
    console.error(`Kesalahan berlangganan di ${channelName}:`, status);
    showMessageBox("Gagal berlangganan saluran chat. Coba lagi.", "error");
  });
}

// --- Fitur Profil ---

profileButton.addEventListener("click", () => {
  if (!loggedInUser) {
    showMessageBox("Anda harus login untuk melihat profil.", "info");
    return;
  }
  displayUserName.textContent = loggedInUser.name;
  displayUserEmail.textContent = loggedInUser.email;
  displayUserPhone.textContent = loggedInUser.phone_number;
  editUserNameInput.value = loggedInUser.name;
  profileMessage.textContent = "";
  showModal(profileModal);
});

function closeProfileModal() {
  hideModal(profileModal);
}

updateNameButton.addEventListener("click", async () => {
  const newName = editUserNameInput.value.trim();
  if (!newName) {
    profileMessage.textContent = "Nama tidak boleh kosong.";
    profileMessage.className = "mt-4 text-sm font-medium text-red-600";
    return;
  }

  profileMessage.textContent = "Memperbarui nama...";
  profileMessage.className = "mt-4 text-sm font-medium text-blue-600";

  try {
    const response = await fetch(
      `${window.frontendConfig.API_BASE_URL}/users/name/${loggedInUser.userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      }
    );
    const data = await response.json();

    if (data.status === "success") {
      loggedInUser.name = newName; // Perbarui state lokal
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser)); // Perbarui local storage
      loggedInUserNameDisplay.textContent = newName; // Perbarui UI
      displayUserName.textContent = newName; // Perbarui UI modal profil
      profileMessage.textContent = "Nama berhasil diperbarui!";
      profileMessage.className = "mt-4 text-sm font-medium text-green-600";
      showMessageBox("Nama berhasil diperbarui!", "success");
      // Render ulang daftar kontak untuk mencerminkan perubahan nama jika berlaku
      await fetchAllUsers();
    } else {
      profileMessage.textContent = "Gagal memperbarui nama: " + data.message;
      profileMessage.className = "mt-4 text-sm font-medium text-red-600";
    }
  } catch (error) {
    console.error("Error updating name:", error);
    profileMessage.textContent = "Terjadi kesalahan saat memperbarui nama.";
    profileMessage.className = "mt-4 text-sm font-medium text-red-600";
  }
});

// --- Fitur Obrolan Baru ---

newChatButton.addEventListener("click", () => {
  newChatPhoneNumberInput.value = "";
  foundUserDisplay.classList.add("hidden");
  newChatMessage.textContent = "";
  showModal(newChatModal);
});

function closeNewChatModal() {
  hideModal(newChatModal);
}

findUserButton.addEventListener("click", async () => {
  const phoneNumber = newChatPhoneNumberInput.value.trim();
  if (!phoneNumber) {
    newChatMessage.textContent = "Nomor telepon tidak boleh kosong.";
    newChatMessage.className = "mt-4 text-sm font-medium text-red-600";
    return;
  }

  newChatMessage.textContent = "Mencari pengguna...";
  newChatMessage.className = "mt-4 text-sm font-medium text-blue-600";
  foundUserDisplay.classList.add("hidden");

  try {
    const response = await fetch(
      `${
        window.frontendConfig.API_BASE_URL
      }/users/search?phoneNumber=${encodeURIComponent(phoneNumber)}`
    );
    const data = await response.json();

    if (data.status === "success") {
      const foundUser = data.data;
      if (foundUser.id === loggedInUser.userId) {
        newChatMessage.textContent =
          "Anda tidak dapat chat dengan diri sendiri.";
        newChatMessage.className = "mt-4 text-sm font-medium text-red-600";
        foundUserDisplay.classList.add("hidden");
        return;
      }
      foundUserName.textContent = foundUser.name;
      foundUserEmail.textContent = foundUser.email;
      foundUserDisplay.classList.remove("hidden");
      newChatMessage.textContent = "Pengguna ditemukan!";
      newChatMessage.className = "mt-4 text-sm font-medium text-green-600";
      startChatWithFoundUserButton.onclick = () => {
        selectChatPartner(foundUser);
        closeNewChatModal();
        showMessageBox(`Memulai chat dengan ${foundUser.name}`, "info");
      };
    } else {
      newChatMessage.textContent = data.message;
      newChatMessage.className = "mt-4 text-sm font-medium text-red-600";
      foundUserDisplay.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error finding user:", error);
    newChatMessage.textContent = "Terjadi kesalahan saat mencari pengguna.";
    newChatMessage.className = "mt-4 text-sm font-medium text-red-600";
    foundUserDisplay.classList.add("hidden");
  }
});

// Inisialisasi aplikasi saat DOM siap
document.addEventListener("DOMContentLoaded", initChatApp);
