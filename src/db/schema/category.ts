import { pgTable } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull().unique(),
	slug: t.text().notNull().unique(),
	createdAt: t.timestamp().defaultNow().notNull(),
	updatedAt: t.timestamp().defaultNow().notNull(),
}));
