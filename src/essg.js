import path from "path";
import {render} from "preact-render-to-string";
import * as esbuild from "esbuild";
import os from "os";
import crypto from "crypto";
import * as url from 'url';
import fs from "fs";
import yaml from "yaml";

let __dirname=url.fileURLToPath(new URL('.', import.meta.url));

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

export async function build(conf) {
	if (conf.conf) {
		let confPath=path.dirname(path.resolve(conf.conf));
		conf={...conf,...yaml.parse(fs.readFileSync(conf.conf,"utf8"))}

		if (!conf.templatedir)
			conf.templatedir=confPath;
	}

	if (!conf.pages)
		throw new Error("No pages to render.");

	if (!conf.outdir)
		conf.outdir=".";

	if (!conf.hasOwnProperty("doctype"))
		conf.doctype="html";

	for (let page of conf.pages) {
		let outFn=path.join(conf.outdir,page.route);
		let templateFn=path.join(conf.templatedir,page.template);
		console.log(templateFn+" -> "+outFn);

		let mod=await importJsx(templateFn);
		let props={...conf,...page};
		let rendered=render(mod.default(props),{},{pretty: true});

		if (conf.doctype)
			rendered="<!DOCTYPE "+conf.doctype+">\n"+rendered;

		rendered+="\n";

		fs.writeFileSync(outFn,rendered);
	}
}
