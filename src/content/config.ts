import { z, defineCollection } from 'astro:content';

const articlesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        genre: z.enum(['tech', 'lifestyle', 'review', 'news']),
        date: z.date(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        author: z.string().optional(),
        draft: z.boolean().optional().default(false),
    }),
});

export const collections = {
    articles: articlesCollection,
};
