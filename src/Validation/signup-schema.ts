import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

export const signupschema = z.object({
	username: z.string().min(3),
	email: z.email(),
	password: z
		.string()
		.min(10, { message: "pass must be 10 characters long at least " }),
});

export const signupvalidator = zValidator("form", signupschema, (result, c) => {
	if (!result.success) {
		return c.json(
			{
				errors: result.error.issues.map((issue) => issue.message),
			},
			400,
		);
	}
});

export const loginschema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(10, { message: "pass must be 10 characters long at least " }),
});

export const loginvalidator = zValidator("form", loginschema, (result, c) => {
	if (!result.success) {
		return c.json(
			{
				errors: result.error.issues.map((issue) => issue.message),
			},
			400,
		);
	}
});
