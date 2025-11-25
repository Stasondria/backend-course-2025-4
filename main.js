import { Command } from "commander";
import http from "http";
import fs from "fs/promises";
import { XMLBuilder } from "fast-xml-parser";

const program = new Command();

program
    .requiredOption("-i, --input <path>", "шлях до вхідного файлу JSON")
    .requiredOption("-h, --host <host>", "адреса сервера")
    .requiredOption("-p, --port <port>", "порт сервера");

program.parse();
const { input, host, port } = program.opts();

try {
    await fs.access(input);
} catch (err) {
    console.error(`Cannot find input file: ${input}`);
    process.exit(1); // ← завершити програму
}
http.createServer(async (req, res) => {
    try {
        // 1) Читаємо JSON
        const data = await fs.readFile(input, "utf-8");
        let json = JSON.parse(data);

        // 2) Зчитуємо параметри з URL
        const url = new URL(req.url, `http://${host}:${port}`);
        const showVariety = url.searchParams.get("variety") === "true";
        const minPetal = url.searchParams.get("min_petal_length");

        // 3) Фільтр по довжині пелюстки
        if (minPetal) {
            json = json.filter((item) => item.petal.length > Number(minPetal));
        }

        // 4) Формування XML об'єктів
        const flowers = json.map((item) => {
            const flower = {
                petal_length: item.petal.length,
                petal_width: item.petal.width
            };

            if (showVariety) {
                flower.variety = item.variety;
            }

            return flower;
        });

        // 5) Конвертація в XML
        const builder = new XMLBuilder();
        const xml = builder.build({ irises: { flower: flowers } });

        // 6) Відповідь
        res.setHeader("Content-Type", "application/xml");
        res.end(xml);

    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end("Server error");
    } 
}).listen(port, host, () => {
    console.log(`Server running → http://${host}:${port}`);
});
