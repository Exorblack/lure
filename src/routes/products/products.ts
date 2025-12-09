import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { jwt } from "hono/jwt";
import sql from "../../db/database";
import { categories, products } from "../../db/schema";
import { getUserIdFromCookie } from "../../utils/helpers";
import Rolerequire from "../../utils/middleware";
import {
	createProductSchema,
	updateProductSchema,
} from "../../Validation/products-schema";

const product = new Hono();

const Auth = jwt({
	secret: process.env.JWT_SECRET!,
	cookie: "authToken",
});

product.get("/getproducts", Auth, async (c) => {
	try {
		const getproduct = await sql.select().from(products);
		return c.json(getproduct);
	} catch (err) {
		return c.json({
			error: "Failed to load categories",
		});
	}
});

product.get("/getproduct", Auth, async (c) => {
	const categoryName = c.req.query("category");
	const search = c.req.query("search");
	const ownerFromQuery = c.req.query("owner");
	const published = c.req.query("published");

	const page = Number(c.req.query("page"));
	const limit = Number(c.req.query("limit"));
	const offset = (page - 1) * limit;

	const cond = [];

	const getCategoryFromName = async (Name: any) => {
		const [category] = await sql
			.select()
			.from(categories)
			.where(eq(categories.name, Name))
			.limit(1);

		return category?.name || null;
	};

	if (categoryName) {
		const categoryId = await getCategoryFromName(categoryName);
		if (!categoryId) {
			return c.json({
				success: true,
				data: [],
				message: `Category '${categoryName}' not found`,
			});
		}
		cond.push(eq(products.categoryName, categoryId));
	}

	//Search functionality
	if (search) {
		cond.push(
			or(
				like(products.title, `%${search}%`),
				like(products.description, `%${search}%`),
				like(products.categoryName, `%${search}%`),
			),
		);
	}

	//Filter by owner (if provided in query)
	if (ownerFromQuery) {
		cond.push(eq(products.ownerId, ownerFromQuery));
	}

	// Filter by published status
	if (published) {
		cond.push(eq(products.isPublished, published === "true"));
	}

	const authCookie = getCookie(c, "authToken");

	//If NOT logged in, only show published products
	if (!authCookie && !published) {
		cond.push(eq(products.isPublished, true));
	}
	const whereCondition = cond.length > 0 ? and(...cond) : undefined;

	//total items
	const [total] = await sql
		.select({
			count: count(),
		})
		.from(products)
		.where(whereCondition);

	// Execute query
	const productList = await sql
		.select()
		.from(products)
		.where(whereCondition)
		.orderBy(desc(products.createdAt))
		.limit(limit)
		.offset(offset);

	const totalPages = Math.ceil(Number(total.count) / limit);
	return c.json({
		success: true,
		pagination: {
			page,
			limit,
			total: Number(total.count),
			totalPages: totalPages,
		},
		data: productList,
	});
});

//Get single product by ID
product.get("/:id", Auth, async (c) => {
	const productId = c.req.param("id");

	if (!productId) {
		return c.json({ error: "Invalid product ID" }, 400);
	}
	const [FoundProducts] = await sql
		.select()
		.from(products)
		.where(eq(products.id, productId))
		.limit(1);

	if (!FoundProducts) {
		return c.json(
			{
				error: "idk ",
			},
			404,
		);
	}

	if (FoundProducts.isPublished) {
		const USERid = getUserIdFromCookie(c);
		if (!USERid) {
			return c.json({
				error: "we dont know why ?",
			});
		}

		if (FoundProducts.ownerId !== USERid) {
			return c.json({
				ok: "still weird and not fount",
			});
		}
	}

	return c.json({
		success: true,
		data: FoundProducts,
	});
});

//Update existing product
product.put(
	"updateproducts/:id",
	Auth,
	Rolerequire(["seller", "admin"]),
	zValidator("form", updateProductSchema),
	async (c) => {
		const getupdId = c.req.param("id");
		const getusrupdId = getUserIdFromCookie(c);
		const data = c.req.valid("form");

		if (!getusrupdId) {
			return c.json(
				{
					err: "there are something missing ur not the one ",
				},
				400,
			);
		}

		const [checkexistprudact] = await sql
			.select()
			.from(products)
			.where(eq(products.id, getupdId))
			.limit(1);

		if (!checkexistprudact) {
			return c.json({ error: "Product not found" }, 404);
		}

		if (checkexistprudact.ownerId !== getusrupdId) {
			return c.json({
				err: "wrong again",
			});
		}

		const updatedProduct = await sql
			.update(products)
			.set({
				title: data.title,
				description: data.description,
				price: data.price?.toString(),
				categoryName: data.categoryName,
				image: data.image,
				isPublished: data.isPublished,
			})
			.where(eq(products.id, getupdId))
			.returning();

		return c.json({
			success: true,
			message: "Product updated successfully!",
			data: updatedProduct,
		});
	},
),
	//Delete product
	product.delete(
		"delproduct/:id",
		Rolerequire(["seller", "admin"]),
		Auth,
		async (c) => {
			const ProductID = c.req.param("id");
			const userID = getUserIdFromCookie(c);
			if (!userID) {
				return c.json(
					{
						err: "invalid user",
					},
					401,
				);
			}

			const checkexistprod = sql
				.select()
				.from(products)
				.where(eq(products.id, ProductID))
				.limit(1);

			if (!checkexistprod) {
				return c.json(
					{
						err: "there is no prod like this",
					},
					404,
				);
			}
			await sql.delete(products).where(eq(products.id, ProductID));
			return c.json({
				success: true,
				message: `product ${ProductID} deleted successfully!`,
			});
		},
	);

// create products
product.post(
	"createproduct",
	Auth,
	Rolerequire(["seller", "admin"]),
	zValidator("form", createProductSchema),
	async (c) => {
		const data = c.req.valid("form");

		const userId = getUserIdFromCookie(c);

		if (!userId) {
			return c.json({ error: "Unauthorized - Invalid token" }, 401);
		}

		// Check if category exists
		const categoryExists = await sql
			.select()
			.from(categories)
			.where(eq(categories.name, data.categoryName))
			.limit(1);

		if (categoryExists.length === 0) {
			return c.json({ error: "Category not found" }, 404);
		}

		// Insert new product into database
		const newProduct = await sql
			.insert(products)
			.values({
				title: data.title,
				description: data.description,
				price: data.price.toString(),
				image: data.image || null,
				categoryName: data.categoryName,
				ownerId: userId,
				isPublished: data.isPublished,
			})
			.returning();
		return c.json(
			{
				success: true,
				message: "Product created successfully!",
				data: newProduct,
			},
			201,
		);
	},
);

export default product;
