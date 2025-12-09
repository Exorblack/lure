import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const sql = drizzle({
	connection: {
		connectionString: process.env.DB_URL,
	},
	schema: schema,
	logger: true,
	casing: "snake_case",
});

export default sql;
