"use strict";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

import yargs from "yargs";
import chalk from "chalk";

const optionsYargs = yargs(process.argv.slice(2))
	.usage("Uso: $0 [options]")
	.option("f", {
		alias: "from",
		describe: "posição inicial de pesquisa da linha do Cnab",
		type: "number",
		demandOption: true,
	})
	.option("t", {
		alias: "to",
		describe: "posição final de pesquisa da linha do Cnab",
		type: "number",
		demandOption: true,
	})
	.option("n", {
		alias: "name",
		describe: "nome da empresa no arquivo cnab",
		type: "string",
		demandOption: false,
	})
	.option("s", {
		alias: "segmento",
		describe: "tipo de segmento",
		type: "string",
		demandOption: true,
	})
	.example(
		"$0 -f 34 -t 73 -n NOME_EMPRESA -s p",
		"lista a linha e campo que from e to do cnab"
	).argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.resolve(`${__dirname}/cnabExample.rem`);

const { from, to, segmento, name } = optionsYargs;

const sliceArrayPosition = (arr, ...positions) =>
	[...arr].slice(...positions);

const messageLog = (segmento, segmentoType, from, to) => `
----- Cnab linha ${segmentoType.toUpperCase()} -----
posição from: ${chalk.inverse.bgBlack(from)}
posição to: ${chalk.inverse.bgBlack(to)}
item isolado: ${chalk.inverse.bgBlack(
	segmento.substring(from - 1, to)
)}

item dentro da linha ${segmentoType.toUpperCase()}:
  ${segmento.substring(0, from)}${chalk.inverse.bgBlack(
	segmento.substring(from - 1, to)
)}${segmento.substring(to)}

tipo de segmento: ${segmentoType.toUpperCase()}
nome da empresa: ${chalk.inverse.bgBlack(name.substring(name))}
----- FIM ------
`;

const log = console.log;

console.time("leitura Async");

readFile(file, "utf8")
	.then((file) => {
		let search_name = [];
		const cnabArray = file.split("\n");

		const cnabHeader = sliceArrayPosition(cnabArray, 0, 2);

		cnabArray.filter((segmento, key) => {
			const line = segmento
				.substring(33, 73)
				.replace(/[0-9]/g, "");

			if (line.indexOf(name) !== -1) {
				search_name.push({
					key,
					segmento,
				});
			}
		});

		switch (segmento) {
			case "q":
			case "r":
			case "p":
				log(
					messageLog(search_name[0].segmento, segmento, from, to)
				);
				break;
			default:
				log("segmento não encontrado");
		}

		const cnabTail = sliceArrayPosition(cnabArray, -2);
	})
	.catch((error) => {
		console.log(
			"🚀 ~ file: cnabRows.js ~ line 76 ~ error",
			error
		);
	});

console.timeEnd("leitura Async");
