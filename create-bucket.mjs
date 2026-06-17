import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateBucket() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }
  
  console.log("Existing buckets:", buckets.map(b => b.name));
  
  if (!buckets.find(b => b.name === 'profile-photos')) {
    console.log("Bucket 'profile-photos' not found. Creating...");
    const { data, error: createError } = await supabaseAdmin.storage.createBucket('profile-photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log("Bucket created successfully:", data);
    }
  } else {
    console.log("Bucket 'profile-photos' already exists.");
    const { data, error: updateError } = await supabaseAdmin.storage.updateBucket('profile-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
    });
    if (updateError) {
        console.error("Error updating bucket:", updateError);
    } else {
        console.log("Bucket updated to public:", data);
    }
  }
}

checkAndCreateBucket();
