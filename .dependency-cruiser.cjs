/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment:
        "Circular dependencies cause coupling, unpredictability, and bundler issues. Zero cycles allowed.",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "domain-imports-nothing-from-services-components-app",
      comment:
        "Domain layer contains pure business logic and models. It must never depend on services, components, or application routing.",
      severity: "error",
      from: {
        path: "^src/domain",
      },
      to: {
        path: "^src/(services|components|app)",
      },
    },
    {
      name: "components-never-import-services",
      comment:
        "UI components must never import runtime logic from services. Type-only imports from services are permitted temporarily until M3/M4 extraction.",
      severity: "error",
      from: {
        path: "^src/components",
      },
      to: {
        path: "^src/services",
        dependencyTypesNot: ["type-only"],
      },
    },
    {
      name: "app-api-imports-only-services-domain-lib",
      comment:
        "API routes may only import from services, domain, lib, or local route helpers (_lib). They must never import UI components or pages.",
      severity: "error",
      from: {
        path: "^src/app/api",
      },
      to: {
        path: "^src/",
        pathNot: "^src/(app/api|services|domain|lib)",
      },
    },
    {
      name: "not-to-unresolvable",
      comment: "This module depends on a module that cannot be resolved to disk.",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
