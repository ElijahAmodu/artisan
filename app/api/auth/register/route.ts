import { NextRequest, NextResponse } from "next/server";
import { createClient as createBrowserClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      phone,
      role,
      skills,
      bio,
      hourlyRate,
      location,
    } = body;

    // Validate required fields before touching the database.
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // ── Step 1: Create the auth user via the normal browser client.
    // This sets the session cookie so the user is logged in after registration.
    const supabase = await createBrowserClient();
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        // emailRedirectTo is unused when email confirmation is disabled in Supabase dashboard.
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Supabase returns a user even when email confirmation is required,
    // but identities will be empty if the user already exists.
    const user = authData.user;
    if (!user) {
      return NextResponse.json(
        { error: "Could not create user account." },
        { status: 500 },
      );
    }

    // If email confirmation is ON, the user exists but has no session yet.
    // We still insert the profile rows using the service-role client so the
    // admin can see the artisan even before email confirmation.
    const userId = user.id;

    // ── Step 2: Use the service-role client to insert rows, bypassing RLS.
    // The service role key is NEVER sent to the browser — this runs only on the server.
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Insert into public.profiles.
    const { error: profileError } = await serviceClient
      .from("profiles")
      .insert({
        id: userId,
        role,
        full_name: fullName,
        email,
        phone: phone || null,
      });

    if (profileError) {
      // If profile insert fails, clean up the auth user so the email can be reused.
      await serviceClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    // For artisans, insert the extended artisan_profiles row.
    if (role === "artisan") {
      const { error: artisanError } = await serviceClient
        .from("artisan_profiles")
        .insert({
          user_id: userId,
          skills: Array.isArray(skills) ? skills : [],
          bio: bio || null,
          hourly_rate: hourlyRate ? parseFloat(String(hourlyRate)) : null,
          location: location || null,
          is_available: true,
          is_approved: false, // admin must approve before the profile is visible to clients
        });

      if (artisanError) {
        // Roll back the profile row and auth user so registration is fully atomic.
        await serviceClient.from("profiles").delete().eq("id", userId);
        await serviceClient.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: artisanError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true, userId, role });
  } catch (err) {
    console.error("[register] unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
