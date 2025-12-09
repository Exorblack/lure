import { pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	username: t.text().unique(),
	email: t.text().notNull().unique(),
	password: t.text().notNull(),
	role: t.text().default("buyer").notNull(),
	createdAt: t.timestamp().defaultNow().notNull(),
	updatedAt: t.timestamp().defaultNow().notNull(),
	verified: t.boolean("verified").default(false),
	verificationToken: t.text("verification_token").notNull(),
}));
