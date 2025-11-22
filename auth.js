import { supabase } from './supabaseClient.js';

// تسجيل الدخول بالبريد وكلمة المرور
export async function signIn(email, password) {
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) throw error;
  return user;
}

// تسجيل الخروج
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// الحصول على المستخدم الحالي
export function getCurrentUser() {
  return supabase.auth.user();
}
