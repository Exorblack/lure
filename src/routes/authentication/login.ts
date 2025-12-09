import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import sql from "../../db/database";
import { users } from "../../db/schema";
import { cookieOpts, generateToken } from "../../utils/helpers";
import { loginvalidator } from "../../Validation/signup-schema";

const login = new Hono();

login.post("/login", loginvalidator, async (c) => {
	const { email, password }: { email: string; password: string } =
		await c.req.parseBody();

	if (!email || !password) {
		return c.json(
			{
				status: 400,
				message: "something went wrong login",
			},
			410,
		);
	}
	const check = await sql.select().from(users).where(eq(users.email, email));
	if (check.length === 0) {
		return c.json(
			{
				status: 401,
				message: "Invalid email or password",
			},
			401,
		);
	}
	const user = check[0];
	const compare = await Bun.password.verify(password, user.password);

	if (!compare) {
		return c.json(
			{
				status: 401,
				message: "Invalid email or password",
			},
			401,
		);
	}
	const token = await generateToken(user.id);

	setCookie(c, "authToken", token, cookieOpts);

	return c.json(
		{
			status: 200,
			message: "login succfully",
			user: { id: user.id, email: email },
		},
		200,
	);
});

export default login;
