import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    rules: {
      // The app's subject icon/theme system (lib/icon-map.ts, lib/subjects.ts)
      // deliberately looks up a Lucide icon component from a static,
      // module-level Record keyed by the subject's `icon` string from the
      // database, then renders it as <Icon />. The lookup always returns a
      // referentially stable component from that Record, so this pattern is
      // safe despite being computed inside the render body.
      "react-hooks/static-components": "off",
    },
  },
];

export default eslintConfig;
