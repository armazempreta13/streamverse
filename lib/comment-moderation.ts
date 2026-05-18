/**
 * lib/comment-moderation.ts
 * 
 * Robust automatic comment moderation without AI.
 * Uses pattern matching, heuristics, and rate-limiting.
 */

// ─── Banned word lists ────────────────────────────────────────────────────────

const HARD_BAN: RegExp[] = [
  // Slurs and heavy profanity (PT + EN)
  /\b(viado|viad[ao]|bichinha|bicha|sapatão|nig+[ae]r|nigga|fagg?[oei]t|k[i1]ke|chink|sp[i1]c)\b/i,
  // Hate speech triggers
  /\b(matam|matar(am)?|bomb[ae]|terror[i1]smo|explosão|explodir)\b.*\b(escola|criança|gente)\b/i,
  // Sexual content involving minors
  /\b(menor|criança|infanto)\b.{0,30}\b(sexo|nu|nudes?|porn[oô])\b/i,
  // Doxxing patterns
  /\b(endereço|cpf|rg)\s*[:=]\s*[\d\.]+/i,
  // Threats
  /\b(vou te|vai se|te mato|te matar|sua morte|você vai morrer)\b/i,
];

const SOFT_BAN: RegExp[] = [
  // Common Portuguese profanity
  /\b(porra|caralho|foda[- ]?se|vai tomar no|me chupa|sua mãe|sua mae|filha da puta|fdp|vsf|krl)\b/i,
  // English profanity
  /\b(f+u+c+k+|sh[i1]t|b[i1]tch|[a4]ss+h[o0]le|d[i1]ck|c[o0]ck|pussy|motherfucker|wtf)\b/i,
  // Spam patterns
  /\b(clique aqui|acesse|grátis|ganhe|lucro|renda extra|pix|bitcoin)\b.{0,60}\b(link|http|www|\.com)\b/i,
  // Excessive caps (SHOUTING)
];

// ─── Moderation levels ────────────────────────────────────────────────────────

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; code: 'HARD_BAN' | 'SOFT_BAN' | 'SPAM' | 'TOO_SHORT' | 'TOO_LONG' | 'CAPS' | 'REPEAT' | 'LINK' };

export function moderateComment(text: string, history: string[] = []): ModerationResult {
  const t = text.trim();

  // Length checks
  if (t.length < 2) return { ok: false, reason: 'Comentário muito curto.', code: 'TOO_SHORT' };
  if (t.length > 1000) return { ok: false, reason: 'Comentário muito longo (máx 1000 caracteres).', code: 'TOO_LONG' };

  // Hard ban — block immediately
  for (const pattern of HARD_BAN) {
    if (pattern.test(t)) {
      return { ok: false, reason: 'Conteúdo não permitido nesta plataforma.', code: 'HARD_BAN' };
    }
  }

  // Soft ban
  for (const pattern of SOFT_BAN) {
    if (pattern.test(t)) {
      return { ok: false, reason: 'Seu comentário contém linguagem inadequada.', code: 'SOFT_BAN' };
    }
  }

  // Links not allowed
  if (/https?:\/\/|www\.|\.com|\.net|\.org|\.io/i.test(t)) {
    return { ok: false, reason: 'Links não são permitidos nos comentários.', code: 'LINK' };
  }

  // Excessive CAPS (> 70% uppercase in strings > 8 chars)
  if (t.length > 8) {
    const letters = t.replace(/[^a-zA-ZÀ-ú]/g, '');
    const upper = letters.replace(/[^A-ZÀÁÂÃÄÅÆÇÈÉÊË]/g, '');
    if (letters.length > 0 && upper.length / letters.length > 0.7) {
      return { ok: false, reason: 'Evite escrever em CAPS LOCK.', code: 'CAPS' };
    }
  }

  // Repeat character spam (e.g. "aaaaaaaaaaaa" or "kkkkkkkkk")
  if (/(.)\1{8,}/.test(t)) {
    return { ok: false, reason: 'Comentário detectado como spam.', code: 'SPAM' };
  }

  // Duplicate recent comment
  if (history.includes(t)) {
    return { ok: false, reason: 'Você já enviou esse comentário recentemente.', code: 'REPEAT' };
  }

  return { ok: true };
}

// ─── Rate limit (client-side token bucket) ───────────────────────────────────

const RATE_KEY = 'sv_comment_rate';
const MAX_PER_MINUTE = 3;

export function checkRateLimit(): boolean {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const data = raw ? JSON.parse(raw) : { count: 0, windowStart: Date.now() };
    const now = Date.now();

    // Reset window after 60s
    if (now - data.windowStart > 60_000) {
      localStorage.setItem(RATE_KEY, JSON.stringify({ count: 1, windowStart: now }));
      return true;
    }

    if (data.count >= MAX_PER_MINUTE) return false;

    localStorage.setItem(RATE_KEY, JSON.stringify({ count: data.count + 1, windowStart: data.windowStart }));
    return true;
  } catch {
    return true;
  }
}
