import * as z from "zod";

export const createProductSchema = z.object({
	title: z.string().min(3).max(200),
	description: z.string().min(10).max(5000),
	price: z.string().transform(Number),
	categoryName: z.string(),
	image: z.string().optional(),
	isPublished: z.string().transform((val) => val === "true"),
});

export const updateProductSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	description: z.string().min(10).max(5000).optional(),
	price: z.string().transform(Number).optional(),
	categoryName: z.string().optional(),
	image: z.string().optional(),
	isPublished: z
		.string()
		.transform((val) => val === "true")
		.optional(),
});
