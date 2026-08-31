import { supabase, isSupabaseConfigured } from './supabase';

// Stripe Checkout, via the create-donation-checkout Edge Function (keeps
// the secret key server-side). Returns a checkout URL to open in the
// browser/in-app browser; returns null with a message if donations
// aren't configured yet (no STRIPE_SECRET_KEY set).
export const createDonationCheckout = async (
  amountCents: number,
  projectId?: string | null,
  donorEmail?: string | null
): Promise<{ url: string | null; error: string | null }> => {
  if (!isSupabaseConfigured || !supabase) return { url: null, error: 'Donations require a configured Supabase project.' };
  const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
    body: { amountCents, projectId: projectId || null, donorEmail: donorEmail || null }
  });
  if (error) {
    const context = (error as any)?.context;
    if (context?.json) {
      const body = await context.json().catch(() => null);
      if (body?.error) return { url: null, error: body.error };
    }
    return { url: null, error: error.message || 'Could not start checkout.' };
  }
  if (data?.error) return { url: null, error: data.error };
  return { url: data?.url || null, error: null };
};
