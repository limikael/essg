#!/usr/bin/env node

import yargs from "yargs";
import {build} from "./essg.js";
import fs from "fs";

let y=yargs(process.argv.slice(2))
	.scriptName("essg")
	.option("conf",{
		describe: "Configuration file."
	})
	.option("pages",{
		describe: "Array of pages."
	})
	.option("outdir",{
		describe: "Output directory.",
	})
	.option("route",{
		describe: "Only build this route.",
	})
	.option("templatedir",{
		describe: "Template directory.",
	})
	.option("doctype",{
		describe: "Doctype to append to rendered content."
	})
	.epilog("conf or pages required.")
	.strict()

if (!y.argv.pages && !y.argv.conf) {
	y.showHelp();
	process.exit();
}

try {
	await build(y.argv);
}

catch (e) {
	console.log(e.message);
	process.exit(1);
}
