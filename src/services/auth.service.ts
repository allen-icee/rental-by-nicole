import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.warn("Could not read admin session.", error);
    return null;
  }

  return data.session;
}

export async function isCurrentUserOwner(): Promise<boolean> {
  const session = await getCurrentSession();

  if (!session) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_owner");

  if (error) {
    console.warn("Could not verify owner role. Run the Supabase migration and add the owner row.", error);
    return false;
  }

  return data === true;
}

async function resolveOwnerEmail(login: string): Promise<string | null> {
  const normalizedLogin = login.trim();

  if (!normalizedLogin) {
    return null;
  }

  if (normalizedLogin.includes("@")) {
    return normalizedLogin;
  }

  const { data, error } = await supabase.rpc("get_owner_email_for_login", {
    login_input: normalizedLogin
  });

  if (error) {
    console.warn("Could not resolve owner username. Run the username login migration.", error);
    return null;
  }

  return data;
}

export async function signInOwner(login: string, password: string) {
  const email = await resolveOwnerEmail(login);

  if (!email) {
    return {
      data: { user: null, session: null },
      error: new Error("Owner username was not found.")
    };
  }

  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error) {
    return result;
  }

  const isOwner = await isCurrentUserOwner();

  if (!isOwner) {
    await supabase.auth.signOut();
    return {
      data: result.data,
      error: new Error("This account is not registered as a Rental by Nicole owner.")
    };
  }

  return result;
}

export async function signOutOwner() {
  return supabase.auth.signOut();
}
