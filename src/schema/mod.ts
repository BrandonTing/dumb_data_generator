import { z } from "zod";

export const string = z.string();
export const number = z.number();
export const boolean = z.boolean();

export const ZodMap = {
    string,
    number,
    boolean
} as const

export type SerializedSchema = Array<{
    name: string,
    type: keyof typeof ZodMap, 
}>

export const genZodSchema = (serializedSchema: SerializedSchema): z.Schema => {
    const objectBodySchema: {
        [key: string]: z.Schema
    } = serializedSchema.reduce((pre, cur) => {
        return Object.assign(pre, {[cur.name]:ZodMap[cur.type] })
    }, {}) 
    return z.object(objectBodySchema)
}
