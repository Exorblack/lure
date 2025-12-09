import { Hono } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";

const logout = new Hono();

logout.post("/logout", (c) => {
	const authToken = getCookie(c, "authToken");

	if (!authToken) {
		return c.json({ status: 400, message: "No active session found." }, 400);
	}
	deleteCookie(c, "authToken", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	return c.json({
		status: 200,
		message: "user logout successful",
	});
});

export default logout;
