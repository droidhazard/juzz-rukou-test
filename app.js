const fs = require("fs");
const readline = require("readline");
const path = "./database.json";

function loadDatabase() {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function saveDatabase(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

function getRandomPendingRuku(data) {
  const pending = data.filter((r) => r.status === "pending");
  if (pending.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pending.length);
  return pending[randomIndex];
}

function resetStatuses(data) {
  return data.map((r) => ({ ...r, status: "pending" }));
}

function showProgress(data) {
  const total = data.length;
  const done = data.filter((r) => r.status === "done").length;
  const pending = total - done;
  const percentage = ((done / total) * 100).toFixed(2);

  console.log(`📊 Progress: ${done}/${total} rukus done`);
  console.log(`⏳ ${percentage}% complete, ${pending} pending\n`);
}

function startTest() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function nextRuku() {
    let data = loadDatabase();
    let ruku = getRandomPendingRuku(data);

    if (!ruku) {
      console.log("\n✅ All rukus done! Resetting...\n");
      data = resetStatuses(data);
      saveDatabase(data);
      ruku = getRandomPendingRuku(data);
    }

    console.log(`📖 ${ruku.surahName} - Ruku ${ruku.rukuNumber}`);
    console.log("➡️  Press Enter when done...");

    rl.once("line", () => {
      const index = data.findIndex(
        (r) =>
          r.surahName === ruku.surahName && r.rukuNumber === ruku.rukuNumber
      );

      if (index !== -1) {
        data[index].status = "done";
        saveDatabase(data);
        console.log("✅ Marked as done.\n");
      }

      nextRuku(); // continue loop
    });
  }

  nextRuku();
}

// CLI Options Handling
const args = process.argv.slice(2);
const data = loadDatabase();

if (args.includes("--reset")) {
  const resetData = resetStatuses(data);
  saveDatabase(resetData);
  console.log("🔁 All rukus reset to pending.");
} else if (args.includes("--progress")) {
  showProgress(data);
} else {
  startTest(); // default action
}
