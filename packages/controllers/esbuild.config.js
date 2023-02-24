import esbuild from "esbuild"

let ctx = await esbuild.context({
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outdir: "dist",
  plugins: [],
})

if (process.argv.includes("--watch")) {
  await ctx.watch()
  console.log("esbuild watching...")
} else {
  await ctx.rebuild()
  await ctx.dispose()
}
