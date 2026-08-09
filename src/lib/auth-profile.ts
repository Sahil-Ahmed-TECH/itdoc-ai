import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Creates or updates the profile row in public.users for the signed-in user.
 * Never stores credentials — only id, email, full_name and default role.
 */
export async function ensureUserProfile(user: User) {
  const fullName =
    (user.user_metadata?.["full_name"] as string | undefined) ??
    (user.user_metadata?.["name"] as string | undefined) ??
    null;

  const { data: existing } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("users").insert({
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      role: "user",
    });
    return;
  }

  await supabase
    .from("users")
    .update({
      email: user.email ?? null,
      full_name: fullName ?? existing.full_name,
    })
    .eq("id", user.id);
}
