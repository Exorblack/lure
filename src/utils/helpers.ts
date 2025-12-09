import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";
import sql from "../db/database";
import { users } from "../db/schema";

export interface User {
	id: number;
	username: string;
	email: string;
}

export const cookieOpts = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	maxAge: 36000,
	path: "/",
	sameSite: "Strict",
} as CookieOptions;

//generateToken
export const generateToken = async (ins: string) => {
	const secert = process.env.JWT_SECRET;
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		sub: ins,
		iat: now,
		exp: now + 1 * 60 * 60,
	};
	const token = await sign(payload, secert!);
	return token;
};

//getUserById
export async function getUserById(id: string) {
	const [result] = await sql.select().from(users).where(eq(users.id, id));
	return result || null;
}

//getUserIdFromCookie
export const getUserIdFromCookie = (c: any): string | null => {
	const payload = c.get("jwtPayload");
	return payload.userId || payload.id || payload.sub || payload.user_id || null;
};

//sendVerificationEmail
export async function sendVerificationEmail(email: string, link: string) {
	const resendKey = process.env.RESEND_API_KEY!;

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${resendKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: "Mohamed Hassan <no-reply@lure.com>",
			to: email,
			subject: "Please verify your email",
			html: `<h2>Verify your email</h2>
				     <p>Click the link below to verify your account:</p>
				     <a href="${link}">${link}</a>`,
		}),
	});

	if (!res.ok) {
		console.error("Failed to send verification email:", await res.json());
	}
}
