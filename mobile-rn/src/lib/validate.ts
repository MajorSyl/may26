// Client-side validation for public forms (contact, RSVP, applications,
// newsletter). RLS on these tables intentionally allows anonymous inserts
// (public.inquiries, event_rsvps, project_applications,
// newsletter_subscribers all have `with_check: true`), so this is the only
// validation layer before the request reaches the database -- keep it
// meaningful, not just cosmetic.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.length <= 254;
}

export const MAX_NAME_LENGTH = 100;
export const MAX_MESSAGE_LENGTH = 2000;
