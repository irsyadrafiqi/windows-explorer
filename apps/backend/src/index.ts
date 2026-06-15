import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { folderRoutes }
from "./presentation/routes/folder.routes";

const app =
  new Elysia()

    .use(cors())

    .use(
      swagger()
    )

    .use(
      folderRoutes
    )

    .get("/", () => ({
      status: "ok",
    }))

    .listen(3000);

console.log(
  `Server running on port ${app.server?.port}`
);