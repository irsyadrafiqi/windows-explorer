import { Elysia, t } from "elysia";
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
    )

    .post(
      "/",
      ({ body }) =>
        FolderController.createFolder(
          body.name,
          body.parentId
        ),
      {
        body: t.Object({
          name: t.String(),
          parentId: t.Optional(t.Number()),
        }),
      }
    )
    .put(
      "/:id",
      ({ params, body }) =>
        FolderController.renameFolder(
          Number(params.id),
          body.name
        ),
      {
        body: t.Object({
          name: t.String(),
        }),
      }
    )

    .delete(
      "/:id",
      ({ params }) =>
        FolderController.deleteFolder(
          Number(params.id)
        )
    )
