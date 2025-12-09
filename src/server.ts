import { Hono } from "hono";
import { cors } from "hono/cors";
// import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";
import { secureHeaders } from "hono/secure-headers";
import admin from "./routes/authentication/admins/admin";
import login from "./routes/authentication/login";
import logout from "./routes/authentication/logout";
import me from "./routes/authentication/profile/me";
import signups from "./routes/authentication/signups";
import category from "./routes/categories/category";
import products from "./routes/products/products";

const app = new Hono().basePath("/api");

app.use(secureHeaders());
app.use("/api/*", cors());

// Protected routes
app.use(
	"/profile/*",
	jwt({ secret: process.env.JWT_SECRET!, cookie: "authToken" }),
);
app.use(
	"/admins/*",
	jwt({ secret: process.env.JWT_SECRET!, cookie: "authToken" }),
);

// app.use(
// 	csrf({
// 		origin: "*",
// 	}),
// );

app.get("/", (c) => {
	return c.json({
		message: "Welcome to the API! ",
		version: "1.0.0",
	});
});

app.notFound((c) => {
	return c.json({ error: "Page not found try again" }, 404);
});

//auth
app.route("/auth", signups);
app.route("/auth", login);
app.route("/auth", logout);

//profile
app.route("/profile", me);

//catogries
app.route("/categories", category);
app.route("/products", products);

//admin
app.route("/admins", admin);

export default {
	port: 8080,
	fetch: app.fetch,
};
