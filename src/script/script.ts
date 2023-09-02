import inquirer, { type QuestionCollection } from 'inquirer'
import { SerializedSchema, ZodMap, genZodSchema, serializedSchema } from '../schema/mod';
import { createFixture } from 'zod-fixture';
import { access, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { z } from 'zod';

async function saveFilePrompt<T>(data: T) {
    const { filePath } = await inquirer.prompt<{
        filePath: string
    }>([{
        type: "input",
        name: "filePath",
        message: "Where should I save data to?",
        default: "./dumb/data",
        filter(input) {
            return new Promise((res, rej) => {
                if (!input.length) {
                    rej("Please provide path!")
                }
                res(input)
            });
        },
    }])
    const folder = filePath.split('/').slice(0, -1).join('/');
    const endFilePath = filePath + ".js"
    access(folder, (err) => {
        if (err) {
            mkdirSync(folder)
        }
        if (typeof data !== 'object' || Array.isArray(data)) {
            writeFileSync(endFilePath, `modile.exports = ${data}`)
        } else {
            writeFileSync(endFilePath, `modile.exports = ${JSON.stringify(data, null, 2)}`)
        }
    })
}

async function main() {
    const initQuestion: QuestionCollection<{
        type: keyof typeof ZodMap,
        isSaveToFile: boolean
    }> = [
            {
                type: 'list',
                name: "type",
                message: "Select type of dumb data",
                choices: Object.keys(ZodMap),

            },
            {
                type: 'confirm',
                name: "isSaveToFile",
                message: "Should I save result to file?",
            }
        ];

    const { type, isSaveToFile } = await inquirer.prompt(initQuestion)
    if (type !== 'object' && type !== 'array') {
        const data = createFixture(ZodMap[type]);
        if (isSaveToFile) {
            return await saveFilePrompt<string | number | boolean>(data)
        }
        return
    } else if (type === "array") {
        const { arrayChildType } = await inquirer.prompt<{
            arrayChildType: Exclude<keyof typeof ZodMap, "object" | "array">,
        }>({
            name: "arrayChildType",
            message: "What's the type of data in array?",
            choices: Object.keys(ZodMap).filter(k => k !== "array" && k !== "object"),
            type: "list"
        })
        const data = createFixture(z.array(ZodMap[arrayChildType]));
        if (isSaveToFile) {
            return await saveFilePrompt<Array<string | number | boolean>>(data)
        }
        console.log(data)
        return
    }

    const { schemaPath } = await inquirer.prompt<{
        schemaPath: SerializedSchema
    }>([
        {
            name: "schemaPath",
            type: 'input',
            default: './dumb/schema.json',
            filter(input) {
                return new Promise((res, rej) => {
                    try {
                        const schema = JSON.parse(readFileSync(input).toString());
                        serializedSchema.parse(schema);
                        res(schema)
                    } catch (err) {
                        rej("Please provide valid schema")
                    }
                });
            },
        }

    ])
    const data = createFixture(genZodSchema(schemaPath));
    if (isSaveToFile) {
        await saveFilePrompt<object>(data);
        return
    }
    console.log(data)
}

main()