import { Elysia } from "elysia";
import { FolderController } from "../controllers/FolderController";

export const folderRoutes =
  new Elysia({
    prefix:
      "/api/v1/folders",
  })

    .get(
      "/tree",
      () =>
        FolderController.getTree()
    )

    .get(
      "/:id/children",
      ({ params }) =>
        FolderController.getChildren(
          Number(params.id)
        )
    )

    .get(
      "/:id/content",
      ({ params }) =>
        FolderController.getContent(
          Number(params.id)
        )
    )

    .get(
      "/search",
      ({ query }) =>
        FolderController.search(
          String(
            query.q || ""
          )
        )
    );