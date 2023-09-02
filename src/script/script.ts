import inquirer, { QuestionCollection } from 'inquirer'
import { SerializedSchema, ZodMap, genZodSchema, serializedSchema } from '../schema/mod';
import { createFixture } from 'zod-fixture';
import { access, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

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
    access(folder, (err) => {
        if (err) {
            mkdirSync(folder)
        }
        if (typeof data === 'object') {
            writeFileSync(path.join(filePath, '.json'), JSON.stringify(data))
        } else {
            writeFileSync(filePath, String(data))
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
        await saveFilePrompt(data);
        return
    }
    console.log(data)
}

main()