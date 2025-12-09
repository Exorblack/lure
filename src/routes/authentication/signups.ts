import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import sql from "../../db/database";
import { users } from "../../db/schema";
import {
	cookieOpts,
	generateToken,
	sendVerificationEmail,
} from "../../utils/helpers";
import { signupvalidator } from "../../Validation/signup-schema";

const signups = new Hono();

signups.post("/signup", signupvalidator, async (c) => {
	const {
		username,
		email,
		password,
	}: { username: string; email: string; password: string } =
		await c.req.parseBody();

	if (!username || !email || !password) {
		return c.json(
			{
				status: 400,
				message: "something went wrong please try again",
			},
			400,
		);
	}
	const existingUser = await sql
		.select()
		.from(users)
		.where(or(eq(users.email, email), eq(users.username, username)));

	if (existingUser.length > 0) {
		return c.json(
			{
				status: 409,
				message: "Email or username already exists",
			},
			409,
		);
	}

	const hashedpass = await Bun.password.hash(password);
	const verificationToken = Bun.randomUUIDv7();

	const ins = await sql
		.insert(users)
		.values({
			username: username,
			email: email,
			password: hashedpass,
			verified: false,
			verificationToken,
		})
		.returning({ id: users.id });

	if (ins.length === 0) {
		return c.json(
			{
				status: 500,
				message: "Failed to create user",
			},
			500,
		);
	}

	const verifyLink = `http://localhost:8080/api/auth/verify?token=${verificationToken}`;

	await sendVerificationEmail(email, verifyLink);

	const insuser = ins[0];
	const token = await generateToken(insuser.id);

	setCookie(c, "authToken", token, cookieOpts);

	return c.json(
		{
			status: 201,
			message: "user created successfully",
			user: { id: insuser.id, email: email, username: username },
		},
		201,
	);
});

export default signups;
