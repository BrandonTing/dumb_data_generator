import { SerializedSchema, genZodSchema } from "./src/schema/mod.ts";
import { generateMock } from '@anatine/zod-mock';

// expected output 
const input = [
    {
        name: "userId",
        type: "number",
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
console.log(generateMock(inputSchema, {seed: 1}))
console.log(generateMock(inputSchema))
console.log(generateMock(inputSchema, {seed: 1}))
