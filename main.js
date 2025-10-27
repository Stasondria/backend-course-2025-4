import { Command } from "commander";
import http from "http";
import fs from "fs/promises";

const program = new Command();

program
    .requiredOption("-i, --input <path>", "шлях до вхідного файлу JSON")
    .requiredOption("-h, --host <host>", "адреса сервера")
    .requiredOption("-p, --port <port>", "порт сервера");

program.parse();
const options = program.opts();

http.createServer((req, res) => {
    res.end("Server works!");
}).listen(options.port, options.host, () => {
    console.log("Server started");
});
