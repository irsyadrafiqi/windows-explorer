import { PrismaClient }
from "@prisma/client";

const prisma =
  new PrismaClient();

async function main() {
  const root =
    await prisma.folder.create({
      data: {
        name: "Root",
      },
    });

  const docs =
    await prisma.folder.create({
      data: {
        name: "Documents",
        parentId: root.id,
      },
    });

  const projects =
    await prisma.folder.create({
      data: {
        name: "Projects",
        parentId: docs.id,
      },
    });

  const images =
    await prisma.folder.create({
      data: {
        name: "Images",
        parentId: root.id,
      },
    });

  await prisma.file.create({
    data: {
      name: "report",
      extension: "pdf",
      size: 1024,
      folderId: docs.id,
    },
  });

  await prisma.file.create({
    data: {
      name: "project-plan",
      extension: "txt",
      size: 512,
      folderId: projects.id,
    },
  });

  await prisma.file.create({
    data: {
      name: "logo",
      extension: "png",
      size: 2048,
      folderId: images.id,
    },
  });
}

main()
  .then(() =>
    prisma.$disconnect()
  )
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });