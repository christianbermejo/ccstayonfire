import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js'

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------- Tabs --------------------
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(tab => tab.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
});

// -------------------- Load counters --------------------
async function loadCounters() {
  const snapshot = await getDocs(collection(db, "submissions"));
  let total = snapshot.size;
  let stranger = 0, gospel = 0;

  snapshot.forEach(docItem => {
    const data = docItem.data();
    if (data.activity === "stranger") stranger++;
    if (data.activity === "gospel") gospel++;
  });

  document.getElementById("peopleReached").textContent = total;
  document.getElementById("prayedStranger").textContent = stranger;
  document.getElementById("sharedGospel").textContent = gospel;
}

// -------------------- Public entries --------------------
async function loadPublicEntries() {
  const container = document.getElementById("publicEntries");
  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "submissions"));

  snapshot.forEach(docItem => {
    const data = docItem.data();

    const div = document.createElement("div");
    div.classList.add("public-entry");

    div.innerHTML = `
      <p><strong>${data.name}</strong> (${data.church})</p>
      <p>🔥 ${
        data.activity === "stranger"
          ? "Prayed for a stranger/unbeliever"
          : "Shared the gospel"
      }</p>
    `;

    container.appendChild(div);
  });
}

// -------------------- Submit entry --------------------
document.getElementById("submitBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const church = document.getElementById("church").value.trim();
  const activity = document.getElementById("whatHappened").value;
  const confirmation = document.getElementById("confirmation");

  if (!name || !church || !activity) {
    confirmation.textContent = "⚠️ Please fill in required fields.";
    return;
  }

  await addDoc(collection(db, "submissions"), {
    name, church, activity, timestamp: new Date()
  });

  confirmation.textContent = "🔥 Submission recorded!";
  setTimeout(() => (confirmation.textContent = ""), 2500);

  document.querySelectorAll("#mainTab input, #mainTab select").forEach(el => el.value = "");

  loadCounters();
  loadPublicEntries();
});

// -------------------- Stories --------------------
document.getElementById("submitStory").addEventListener("click", async (e) => {
  e.preventDefault();
  const storyName = document.getElementById("storyName").value.trim();
  const storyText = document.getElementById("storyText").value.trim();
  if (!storyName || !storyText) return;

  await addDoc(collection(db, "stories"), {
    storyName, storyText, timestamp: new Date()
  });

  document.getElementById("storyName").value = "";
  document.getElementById("storyText").value = "";
  loadStories(adminActive);
});

// -------------------- Load stories --------------------
let adminActive = false;

async function loadStories(isAdmin=false){
  const wall = document.getElementById("storyWall");
  wall.innerHTML = "";
  const snapshot = await getDocs(collection(db,"stories"));
  snapshot.forEach(docItem => {
    const data = docItem.data();
    const div = document.createElement("div");
    div.classList.add("story-card");
    div.innerHTML = `<h4>${data.storyName}</h4><p>${data.storyText}</p>`;
    wall.appendChild(div);
  });
}

// -------------------- Init --------------------
loadCounters();
loadPublicEntries();
loadStories();
