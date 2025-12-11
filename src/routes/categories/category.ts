import { Hono } from "hono";
import { jwt } from "hono/jwt";
import sql from "../../db/database";
import { categories } from "../../db/schema";
import { isAdmin } from "../../utils/middleware";

const category = new Hono();

const Auth = jwt({
	secret: process.env.JWT_SECRET!,
	cookie: "authToken",
});

// Get all categories
category.get("/category", async (c) => {
	try {
		const allcateg = await sql.select().from(categories);
		return c.json(allcateg);
	} catch (err) {
		return c.json({ error: "Failed to load categories" }, 500);
	}
});

// Create a new category
category.post("/category", Auth, isAdmin, async (c: any) => {
	const body = await c.req.parseBody();
	const { name, slug } = body;
	if (!name || !slug) {
		return c.json({ message: "missing category" }, 400);
	}
	try {
		await sql.insert(categories).values({ name, slug });
		return c.json({ success: true });
	} catch (err) {
		console.error(err);
		return c.json({ error: "Failed to create category" }, 500);
	}
});
export default category;
