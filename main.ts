import { SerializedSchema, genZodSchema } from "./src/schema/mod";
import { createFixture } from 'zod-fixture';

// expected output 
const input = [
    {
        name: "userId",
        type: "number",
        optional: true
    },
    {
        name: "name",
        type: "string",
    },
    {
        name: "followers",
        type: "array",
        children: "string"
    },
    {
        name: "posts",
        type: "array",
        children: "object"
    },
    {
        name: "post",
        type: "object",
        parent: "posts"
    },
    {
        name: "name",
        type: "string",
        parent: "post"
    },
    {
        name: "content",
        type: "string",
        parent: "post"  
    },
    {
        name: "isActive",
        type: "boolean",
    },
] satisfies SerializedSchema;

const inputSchema = genZodSchema(input);
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
console.log(createFixture(inputSchema))
