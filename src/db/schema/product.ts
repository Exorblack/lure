import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./auth/users";

export const products = pgTable("products", (t) => ({
	id: t.uuid().primaryKey().defaultRandom(),
	title: t.text().notNull(),
	description: t.text(),
	price: t.numeric({ precision: 10, scale: 2 }).notNull(),
	image: t.text(),
	categoryName: t.text().notNull(),
	ownerId: t
		.uuid()
		.references(() => users.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		})
		.notNull(),
	isPublished: t.boolean().default(false),
	createdAt: t.timestamp().defaultNow(),
	updatedAt: t.timestamp().defaultNow(),
}));
