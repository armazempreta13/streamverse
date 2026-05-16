import { z } from 'zod';

export const IframeSchema = z.object({
  src: z.string().url().or(z.string()),
  player_id: z.string().nullable().optional(),
  data_id: z.string().nullable().optional(),
  data_video: z.string().nullable().optional(),
});

export const EpisodeSchema = z.object({
  url: z.string().url().or(z.string()),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  episode_number: z.number().nullable().optional(),
  season_number: z.number().nullable().optional(),
  duration: z.string().nullable().optional(),
  iframes: z.array(IframeSchema).optional().default([]),
});

export const SeasonSchema = z.object({
  season_number: z.number().nullable().optional(),
  season_title: z.string().nullable().optional(),
  episodes: z.array(EpisodeSchema).optional().default([]),
});

export const AnimeSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  categories: z.array(z.string()).nullable().optional(),
  seasons: z.array(SeasonSchema).optional().default([]),
});

export const CatalogImportSchema = z.object({
  source: z.string().optional(),
  generated_at: z.string().optional(),
  animes: z.array(AnimeSchema),
});
