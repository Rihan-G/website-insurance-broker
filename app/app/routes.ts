import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Marketing
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("products", "routes/products._index.tsx"),
  route("products/:slug", "routes/products.$slug.tsx"),
  route("blog", "routes/blog._index.tsx"),
  route("blog/:slug", "routes/blog.$slug.tsx"),
  route("claims-guide", "routes/claims-guide.tsx"),
  route("compare", "routes/compare.tsx"),
  route("checklists", "routes/checklists._index.tsx"),
  route("checklists/:id", "routes/checklists.$id.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),

  // Auth
  route("login", "routes/login.tsx"),
  route("admin", "routes/admin.tsx"),

  // Dashboard (protected)
  layout("routes/_dashboard.tsx", [
    route("dashboard", "routes/_dashboard.index.tsx"),
  ]),
] satisfies RouteConfig;
