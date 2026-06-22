const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = "payment_proofs";
const DAYS_TO_KEEP = 7;

async function cleanupOldProofs() {
  const now = new Date();
  console.log(`\n🕐 [${now.toLocaleString()}] Starting cleanup...`);
  
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      console.error("❌ Error listing files:", listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log("ℹ️ No files to clean up");
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);

    const filesToDelete = [];
    for (const file of files) {
      if (file.metadata === null) continue;
      const fileDate = new Date(file.created_at);
      if (fileDate < cutoffDate) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length === 0) {
      console.log("ℹ️ No old files to delete");
      return;
    }

    console.log(`🗑️ Found ${filesToDelete.length} old files to delete`);

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);

    if (deleteError) {
      console.error("❌ Error deleting files:", deleteError);
    } else {
      console.log(`✅ Successfully deleted ${filesToDelete.length} old files`);
    }

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

console.log("🚀 Auto Cleanup Service Started!");
console.log(`📅 Runs every day at 23:00 (11 PM)`);
console.log(`📂 Cleaning up files older than ${DAYS_TO_KEEP} days\n`);

// Jalankan sekali saat startup
cleanupOldProofs();

// Schedule: setiap hari jam 23:00
// Format: second minute hour day month weekday
cron.schedule("0 0 23 * * *", cleanupOldProofs, {
  scheduled: true,
  timezone: "Asia/Jakarta"
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Gracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down...");
  process.exit(0);
});
