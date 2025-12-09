import { Hono } from "hono";
import { getUserById } from "../../../utils/helpers";

interface JWTPayload {
	sub: string;
	iat: number;
	exp: number;
}

const me = new Hono<{ Variables: { jwtPayload: JWTPayload } }>();

me.get("/me", async (c) => {
	const payload = c.get("jwtPayload");
	if (!payload?.sub) {
		return c.json({ staus: 401, message: "Invalid token" }, 401);
	}
	const user = await getUserById(payload.sub);
	if (!user) {
		return c.json({ status: 404, message: "User not found" }, 404);
	}
	const { id, username, email, createdAt, role } = user;
	return c.json({
		status: 200,
		user: { username, email, createdAt, role, id },
	});
});

export default me;
