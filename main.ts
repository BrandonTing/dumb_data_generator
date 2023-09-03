import { ZodSchema } from "zod";
import { genZodSchema, type SerializedSchema } from "./src/schema/mod";
import { createFixture } from 'zod-fixture';

export { genZodSchema } from "./src/schema/mod";

export function createDumbData(schema: SerializedSchema | ZodSchema) {
    if (Array.isArray(schema)) {
        return createFixture(genZodSchema(schema))
    }
    return createFixture(schema)
}