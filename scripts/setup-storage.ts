import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
  try {
    console.log("Setting up Supabase Storage buckets...");

    // Create report-images bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      process.exit(1);
    }

    const reportImagesBucketExists = buckets?.some((b) => b.name === "report-images");

    if (!reportImagesBucketExists) {
      console.log("Creating report-images bucket...");
      const { data, error } = await supabase.storage.createBucket("report-images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });

      if (error) {
        console.error("Error creating bucket:", error);
        process.exit(1);
      }

      console.log("✓ report-images bucket created successfully");
    } else {
      console.log("✓ report-images bucket already exists");
    }

    console.log("\n✓ Storage setup completed successfully!");
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

setupStorage();
