/* Eleventy config */
export const config = {
    dir: {
        output: "dist"
    }
}
export default async function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("node_modules/jquery/dist/jquery.min.js");
    eleventyConfig.addPassthroughCopy("node_modules/@picocss/pico/css/pico.green.min.css");
    eleventyConfig.addPassthroughCopy("*.js");
}