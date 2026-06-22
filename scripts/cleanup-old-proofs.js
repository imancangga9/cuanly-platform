const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

// Load .env.local manually
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

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = "payment_proofs";
const DAYS_TO_KEEP = 7;

async function cleanupOldProofs() {
  console.log("🚀 Starting cleanup of old payment proofs...");
  console.log(`📅 Keeping files newer than ${DAYS_TO_KEEP} days`);

  try {
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      console.error("❌ Error listing files:", listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log("ℹ️ No files found to clean up");
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);

    const filesToDelete = [];

    for (const file of files) {
      // Skip folders
      if (file.metadata === null) continue;

      const fileDate = new Date(file.created_at);
      if (fileDate < cutoffDate) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length === 0) {
      console.log("ℹ️ No old files found to delete");
      return;
    }

    console.log(`🗑️ Found ${filesToDelete.length} files to delete`);

    // Delete old files
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

// Run the cleanup
async function main() {
  try {
    await cleanupOldProofs();
    console.log("✨ Cleanup process completed");
  } catch (error) {
    console.error("💥 Cleanup failed:", error);
  }
  
  // Wait a bit for all connections to close
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

main();
