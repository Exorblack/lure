import { getUserById } from "./helpers";

type Role = "admin" | "seller" | "buyer";

export default function Rolerequire(role: Role | Role[]) {
	const allowed = Array.isArray(role) ? role : [role];
	return async (c: any, next: any) => {
		const payload = c.get("jwtPayload");
		const userId = payload?.sub;
		if (!userId) {
			return c.json({ err: "not u try again" }, 401);
		}
		const user = await getUserById(userId);
		if (!user) return c.json({ error: "Unauthorized" }, 401);
		if (!allowed.includes(user.role as Role)) {
			return c.json({ err: "Forbidden" }, 403);
		}
		await next();
	};
}

export const isAdmin = async (c: any, next: any) => {
	const payload = c.get("jwtPayload");
	const userId = payload?.sub;
	if (!userId) {
		return c.json({ err: "not u try again" }, 401);
	}
	const user = await getUserById(userId);

	if (!user || user.role !== "admin") {
		return c.json({ error: "Forbidden. Admin only." }, 403);
	}

	await next();
};
