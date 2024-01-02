const fs = require("fs");
const path = require("path");

const svgDir = "public/kanjivg/kanji";
const outputJsonFile = "public/svg-list.json";

fs.readdir(svgDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  const svgFiles = files.filter((file) => path.extname(file) === ".svg");

  fs.writeFile(outputJsonFile, JSON.stringify(svgFiles), (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
      return;
    }
    console.log("SVG list JSON file created successfully!");
  });
});
