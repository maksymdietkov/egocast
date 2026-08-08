export interface ToneMeta {
  label: string;
  example: string;
}

// Frontend-only display metadata for tone packs — label + a sample line for the
// picker card. Not served by the backend; keep in sync with templates/{id}/en.yaml.
export const TONE_META: Record<string, ToneMeta> = {
  default: {
    label: 'Classic',
    example:
      'Layer up properly: thermal base, wool sweater, real winter coat.\nSkip the fashion jacket — this is survival gear weather.',
  },
  mom: {
    label: 'Mom',
    example:
      'Wear the big coat, not the cute one.\nAnd gloves — real gloves, not the thin ones you like.',
  },
};

export function toneLabel(id: string): string {
  return TONE_META[id]?.label ?? id;
}