import fs from "node:fs";
import path from "node:path";

const CONTENT = `
---
import Form from "@/forms/{name}.tsx";

interface Props {
  driver_id: string;
  endpoint: string;
}
---

<Form {...Astro.props} client:idle />
`.trim();

async function setupTransform() {
  const formsDir = "src/forms";
  const cacheDir = ".astro/cache/forms";

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const files = fs.readdirSync(formsDir, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && path.extname(file.name) === ".tsx") {
      const astroFileName = `${path.basename(file.name, ".tsx")}.astro`;
      const content = CONTENT.replace(/{name}/g, path.basename(file.name, ".tsx"));
      const astroPath = path.join(cacheDir, astroFileName);
      fs.writeFileSync(astroPath, content, "utf8");
    }
  }
}

export default function transformTsx() {
  return {
    name: "form-to-astro-plugin",
    hooks: {
      "astro:build:setup": setupTransform,
      "astro:server:setup": setupTransform,
    },
  };
}
