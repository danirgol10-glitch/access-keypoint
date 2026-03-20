import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user with their JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role client to delete all user data and auth account
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete in order to respect foreign keys
    // 1. messages (via conversations)
    const { data: convos } = await adminClient
      .from("conversations")
      .select("id")
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (convos && convos.length > 0) {
      const convoIds = convos.map((c: any) => c.id);
      await adminClient.from("messages").delete().in("conversation_id", convoIds);
    }

    // 2. trade_request_items (via trade_requests)
    const { data: trades } = await adminClient
      .from("trade_requests")
      .select("id")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

    if (trades && trades.length > 0) {
      const tradeIds = trades.map((t: any) => t.id);
      await adminClient.from("trade_request_items").delete().in("trade_request_id", tradeIds);
      // notifications referencing these trades
      await adminClient.from("notifications").delete().in("trade_request_id", tradeIds);
    }

    // 3. Delete remaining user-owned data
    await adminClient.from("trade_requests").delete().or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    await adminClient.from("conversations").delete().or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);
    await adminClient.from("notifications").delete().eq("user_id", userId);
    await adminClient.from("friendships").delete().or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    await adminClient.from("blocked_users").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
    await adminClient.from("reports").delete().or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`);
    await adminClient.from("support_requests").delete().eq("user_id", userId);
    await adminClient.from("user_stickers").delete().eq("user_id", userId);
    await adminClient.from("users").delete().eq("id", userId);

    // 4. Delete auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(JSON.stringify({ error: "Failed to delete auth account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
