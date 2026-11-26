import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { Answer, RoomAnswer, RoomMember } from "./state";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const cloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Falta configurar Supabase.");
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export async function ensureAnonymousUser(): Promise<string> {
  const db = getClient();
  const current = await db.auth.getSession();
  if (current.error) throw current.error;
  if (current.data.session?.user.id) return current.data.session.user.id;
  const created = await db.auth.signInAnonymously();
  if (created.error) throw created.error;
  if (!created.data.user) throw new Error("No se pudo iniciar la sesión de la sala.");
  return created.data.user.id;
}

function roomRow(data: unknown) {
  const row = (Array.isArray(data) ? data[0] : data) as {
    room_id: string; code: string; room_name: string; member_id: string; role: "owner" | "member"; character_id: string;
  } | null;
  if (!row?.room_id || !row.member_id) throw new Error("Supabase no devolvió la sala creada.");
  return row;
}

export async function createCloudRoom(roomName: string, displayName: string) {
  await ensureAnonymousUser();
  const { data, error } = await getClient().rpc("create_room", {
    p_room_name: roomName.trim() || "La Vecindad",
    p_display_name: displayName.trim() || "La dueña",
  });
  if (error) throw error;
  return roomRow(data);
}

export async function joinCloudRoom(code: string, displayName: string, faceData: string) {
  await ensureAnonymousUser();
  const { data, error } = await getClient().rpc("join_room_random", {
    p_code: code.trim().toUpperCase(),
    p_display_name: displayName.trim(),
    p_face_data: faceData,
  });
  if (error) throw error;
  return roomRow(data);
}

export async function saveCloudFace(roomId: string, faceData: string) {
  const { error } = await getClient().rpc("save_room_face", { p_room_id: roomId, p_face_data: faceData });
  if (error) throw error;
}

export async function getCloudMembership(roomId: string, userId: string): Promise<RoomMember | null> {
  const { data, error } = await getClient()
    .from("room_members")
    .select("room_id,user_id,display_name,role,character_id,face_data")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as RoomMember | null;
}

export async function loadCloudRoom(roomId: string): Promise<{ members: RoomMember[]; answers: RoomAnswer[] }> {
  const db = getClient();
  const [memberResult, answerResult] = await Promise.all([
    db.from("room_members").select("room_id,user_id,display_name,role,character_id,face_data").eq("room_id", roomId),
    db.from("answers").select("room_id,member_id,day_n,value,updated_at").eq("room_id", roomId),
  ]);
  if (memberResult.error) throw memberResult.error;
  if (answerResult.error) throw answerResult.error;
  return { members: (memberResult.data || []) as RoomMember[], answers: (answerResult.data || []) as RoomAnswer[] };
}

export async function saveCloudAnswer(roomId: string, memberId: string, day: number, value: Answer | undefined) {
  const db = getClient();
  if (value === undefined) {
    const { error } = await db.from("answers").delete().eq("room_id", roomId).eq("member_id", memberId).eq("day_n", day);
    if (error) throw error;
    return;
  }
  const { error } = await db.from("answers").upsert({
    room_id: roomId, member_id: memberId, day_n: day, value, updated_at: new Date().toISOString(),
  }, { onConflict: "room_id,member_id,day_n" });
  if (error) throw error;
}

export function watchCloudAnswers(roomId: string, onChange: () => void): RealtimeChannel {
  return getClient().channel(`room-answers-${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: `room_id=eq.${roomId}` }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` }, onChange)
    .subscribe();
}

export async function removeCloudChannel(channel: RealtimeChannel) {
  await getClient().removeChannel(channel);
}

