import { supabase } from "./supabase";

const BUCKET = "avatars";

export async function uploadAvatar(file, userId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return publicUrl;
}
