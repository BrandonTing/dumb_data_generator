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
    parent?: string,
    optional?: boolean
}>

function getChildrenSchema (parent: string, serializedSchema: SerializedSchema): SerializedSchema  {
    function helper (parentName: string, schemas: SerializedSchema): SerializedSchema {
        const children: SerializedSchema =  schemas.filter(schema => schema.parent === parentName); 
        const nestingChildren = children.map(child => {
            const sliceIdx = serializedSchema.findIndex(sch=> sch.name === child.name)
            return helper(child.name, serializedSchema.slice(sliceIdx))
        })
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
    } = serializedSchema.reduce((pre, cur, i) => {
        if(cur.parent) {
            return pre
        }
        let schema: z.Schema
        if(cur.type === 'array' ) {
            if(cur.children) {
                if(cur.children === 'object' || cur.children ==='array') {
                    const children = getChildrenSchema(cur.name, serializedSchema.slice(i))
                    schema = z.array(genZodSchema(children))
                } else {
                    schema = ZodMap.array(ZodMap[cur.children])
                }
            } else {
                return pre
            }
        } else if(cur.type === 'object') {
            const children = getChildrenSchema(cur.name, serializedSchema.slice(i))
            schema = genZodSchema(children)
        } else {
            schema = ZodMap[cur.type]
        }
        if(schema) {
            if(cur.optional) {
                schema = schema.optional();                
            }
            return Object.assign(pre, {[cur.name]: schema}) 
        }
        return pre
    }, {}) 
    return z.object(objectBodySchema)
}
