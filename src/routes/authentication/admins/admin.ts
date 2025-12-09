import { eq } from "drizzle-orm";
import { Hono } from "hono";
import sql from "../../../db/database";
import { categories, products, users } from "../../../db/schema";
import { isAdmin } from "../../../utils/middleware";

const admin = new Hono();

admin.get("/usrs", isAdmin, async (c) => {
	const allUsers = await sql.select().from(users);
	return c.json(allUsers);
});

admin.get("/usrs/:id", isAdmin, async (c) => {
	const sid = c.req.param("id");
	const singleUser = await sql.select().from(users).where(eq(users.id, sid));
	return c.json(singleUser);
});

admin.get("/analytics", isAdmin, async (c) => {
	const usersCount = (await sql.select().from(users)).length;
	const productsCount = (await sql.select().from(products)).length;
	const categoriesCount = (await sql.select().from(categories)).length;

	return c.json({
		usersCount,
		productsCount,
		categoriesCount,
	});
});

admin.patch("/usrs/:id", isAdmin, async (c) => {
	const idrole = c.req.param("id");
	const { role } = await c.req.json();
	const checkusr = await sql.select().from(users).where(eq(users.id, idrole));

	if (!checkusr) {
		return c.json(
			{
				message: "there is no user like that",
			},
			404,
		);
	}
	if (!["admin", "seller", "buyer"].includes(role)) {
		return c.json(
			{
				message: "invaled role",
			},
			400,
		);
	}
	await sql.update(users).set({ role }).where(eq(users.id, idrole));
	return c.json({
		message: "role updated succefully",
	});
});

admin.delete("/usrs/:id", isAdmin, async (c) => {
	const usrid = c.req.param("id");

	await sql.delete(users).where(eq(users.id, usrid));
	return c.json({
		message: "user deleted successfully",
	});
});

export default admin;
