import { z } from "zod";

export const string = z.string();
export const number = z.number();
export const boolean = z.boolean();

export const ZodMap = {
    string,
    number,
    boolean,
    object: z.object,
    array: z.array
} as const

export type SerializedSchema = Array<{
    name: string,
    type: keyof typeof ZodMap, 
    children?: keyof typeof ZodMap,
    parent?: string
}>

function getChildrenSchema (parent: string, serializedSchema: SerializedSchema): SerializedSchema  {
    function helper (parentName: string, schemas: SerializedSchema): SerializedSchema {
        const children: SerializedSchema =  schemas.filter(schema => schema.parent === parentName); 
        const nestingChildren = children.map(child => helper(child.name, serializedSchema))
        return children.concat(...nestingChildren)    
    }
    return helper(parent, serializedSchema).map(child => {
        if(child.parent === parent) {
            const {parent, ...rest} = child;
            return rest
        }
        return child
    });
}

export function genZodSchema(serializedSchema: SerializedSchema): z.Schema {
    const objectBodySchema: {
        [key: string]: z.Schema
    } = serializedSchema.reduce((pre, cur) => {
        if(cur.parent) {
            return pre
        }
        if(cur.type === 'array' ) {
            if(cur.children) {
                if(cur.children === 'object' || cur.children ==='array') {
                    const children = getChildrenSchema(cur.name, serializedSchema)
                    return Object.assign(pre, {[cur.name]: z.array(genZodSchema(children))}) 
                }
                return Object.assign(pre, {[cur.name]:ZodMap.array(ZodMap[cur.children])}) 
            }
            return pre
        }
        if(cur.type === 'object') {
            const children = getChildrenSchema(cur.name, serializedSchema)
            return Object.assign(pre, {[cur.name]: genZodSchema(children)}) 
        }
        return Object.assign(pre, {[cur.name]: ZodMap[cur.type]}) 
    }, {}) 
    return z.object(objectBodySchema)
}
