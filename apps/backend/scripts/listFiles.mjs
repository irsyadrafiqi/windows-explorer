import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const folders = await prisma.folder.findMany({ include: { files: true } });
  console.log(JSON.stringify(folders, null, 2));
  const files = await prisma.file.findMany();
  console.log('\nFILES:\n', JSON.stringify(files, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
