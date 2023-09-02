import inquirer, { type QuestionCollection } from 'inquirer'
import { SerializedSchema, ZodMap, genZodSchema, serializedSchema } from '../schema/mod';
import { createFixture } from 'zod-fixture';
import { access, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { z } from 'zod';

async function display<T>(isSaveToFile: boolean, data: T) {
    if (isSaveToFile) {
        await saveFilePrompt<T>(data);
        return
    }
    console.log(data)

}

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
        let insertString = "modile.exports = "
        if (typeof data === 'string') {
            insertString += `"${data}"`
        } else if (typeof data === 'object') {
            insertString += JSON.stringify(data, null, 2)
        } else {
            insertString += data
        }
        writeFileSync(endFilePath, insertString)
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
        return await display(isSaveToFile, data)
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
        return await display(isSaveToFile, data)
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
    await display(isSaveToFile, data)
}

main()