#!/usr/bin/env node
import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number.parseInt(
	getArgValue("--port") ?? process.env.PORT ?? "3000",
	10,
);

if (!existsSync(join(root, "index.html"))) {
	throw new Error(
		"Missing dist/index.html. Run `bun run build` before using the CLI locally.",
	);
}

const mimeTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".glb", "model/gltf-binary"],
	[".html", "text/html; charset=utf-8"],
	[".js", "text/javascript; charset=utf-8"],
	[".json", "application/json; charset=utf-8"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
]);

const server = createServer((request, response) => {
	const url = new URL(
		request.url ?? "/",
		`http://${request.headers.host ?? "localhost"}`,
	);
	const requestedPath = decodeURIComponent(url.pathname);
	const filePath = getSafeFilePath(requestedPath);

	if (!filePath) {
		response.writeHead(403);
		response.end("Forbidden");
		return;
	}

	const resolvedPath = existsSync(filePath)
		? filePath
		: join(root, "index.html");
	response.writeHead(200, {
		"Content-Type":
			mimeTypes.get(extname(resolvedPath)) ?? "application/octet-stream",
	});
	createReadStream(resolvedPath).pipe(response);
});

server.listen(port, () => {
	console.log(`Townbase running at http://localhost:${port}`);
});

function getArgValue(name) {
	const index = process.argv.indexOf(name);
	return index === -1 ? undefined : process.argv[index + 1];
}

function getSafeFilePath(pathname) {
	const normalizedPath = normalize(pathname).replace(/^[/\\]+/, "");
	const filePath = resolve(root, normalizedPath || "index.html");
	return filePath === root || filePath.startsWith(`${root}${sep}`)
		? filePath
		: undefined;
}
