#!/usr/bin/env node

import yaml from "yaml";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import * as esbuild from "esbuild";
import {render} from "preact-render-to-string";
import * as url from 'url';
import yargs from "yargs";

let __dirname=url.fileURLToPath(new URL('.', import.meta.url));

function exit(msg) {
	console.log(msg);
	process.exit(1);
}

function tmpFn(suffix="") {
	return path.join(os.tmpdir(),crypto.randomBytes(16).toString('hex')+suffix);
}

async function importJsx(fn) {
	let outFn=tmpFn(".mjs");

	let options={
		entryPoints: [fn],
		bundle: true,
		outfile: outFn,
		format: "esm",
		jsxFactory: "h",
		jsxFragment: "Fragment",
		inject: [__dirname+"/preact-shim.js"]
	}

	await esbuild.build(options);
	let mod=await import(outFn);

	return mod;
}

async function build(conf) {
	for (let page of conf.pages) {
		try {
			let outFn=path.join(conf.outdir,page.route);
			let templateFn=path.join(conf.templatedir,page.template);
			console.log(templateFn+" -> "+outFn);

			let mod=await importJsx(templateFn);
			let props={...conf,...page};
			let rendered=render(mod.default(props),{},{pretty: true});

			rendered="<!DOCTYPE html>\n"+rendered;

			fs.writeFileSync(outFn,rendered);
		}

		catch (e) {
			console.log(e.message);
			process.exit();
		}
	}
}

let y=yargs(process.argv.slice(2))
	.scriptName("essg")
	.command("build","Build site.")
	.demandCommand(1,1)
	.option("conf",{
		describe: "Configuration file."
	})
	.option("pages",{
		describe: "Array of pages, or YAML file containing pages."
	})
	.option("outdir",{
		describe: "Output directory.",
		default: "."
	})
	.option("templatedir",{
		describe: "Template directory.",
		default: "."
	})
	.strict()

let conf=y.argv;
if (conf.conf)
	conf={...conf,...yaml.parse(fs.readFileSync(conf.conf,"utf8"))}

if (!conf.pages)
	exit("No pages to render.");

switch (conf._[0]) {
	case "build":
		await build(conf);
		break;

	default:
		exit("Unknown command.");
		break;
}
