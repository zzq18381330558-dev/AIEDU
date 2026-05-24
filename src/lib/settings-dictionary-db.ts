import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export type BusinessDictionaryRow = {
  id: string;
  organizationId: string;
  category: string;
  name: string;
  value: string | null;
  enabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BusinessDictionaryCategoryRow = {
  id: string;
  code: string;
  name: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DictionaryData = {
  organizationId: string;
  category: string;
  name: string;
  value: string | null;
  enabled: boolean;
  sortOrder: number;
};

function quotePgLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function ensureDictionaryCategory(category: string) {
  if (Buffer.byteLength(category, "utf8") > 63) {
    throw new Error("字典分类不能超过 63 字节");
  }
  await prisma.$executeRawUnsafe(`ALTER TYPE "DictionaryCategory" ADD VALUE IF NOT EXISTS ${quotePgLiteral(category)}`);
  await prisma.businessDictionaryCategory.upsert({
    where: { code: category },
    update: { name: category },
    create: { code: category, name: category, isSystem: false }
  });
}

export async function listBusinessDictionaries(organizationId: string) {
  return prisma.$queryRaw<BusinessDictionaryRow[]>`
    SELECT
      id,
      "organizationId",
      category::text AS category,
      name,
      value,
      enabled,
      "sortOrder",
      "createdAt",
      "updatedAt"
    FROM "BusinessDictionary"
    WHERE "organizationId" = ${organizationId}
    ORDER BY category::text ASC, "sortOrder" ASC, "createdAt" DESC
  `;
}

export async function listBusinessDictionaryCategories() {
  return prisma.businessDictionaryCategory.findMany({
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }, { name: "asc" }]
  });
}

export async function findBusinessDictionaryDuplicate(data: Pick<DictionaryData, "organizationId" | "category" | "name">, ignoredId?: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "BusinessDictionary"
    WHERE "organizationId" = ${data.organizationId}
      AND category::text = ${data.category}
      AND name = ${data.name}
      AND (${ignoredId || null}::text IS NULL OR id <> ${ignoredId || null})
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createBusinessDictionary(data: DictionaryData) {
  await ensureDictionaryCategory(data.category);
  const id = crypto.randomUUID();
  const rows = await prisma.$queryRaw<BusinessDictionaryRow[]>`
    INSERT INTO "BusinessDictionary" (
      id,
      "organizationId",
      category,
      name,
      value,
      enabled,
      "sortOrder",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${data.organizationId},
      CAST(${data.category} AS "DictionaryCategory"),
      ${data.name},
      ${data.value},
      ${data.enabled},
      ${data.sortOrder},
      now(),
      now()
    )
    RETURNING
      id,
      "organizationId",
      category::text AS category,
      name,
      value,
      enabled,
      "sortOrder",
      "createdAt",
      "updatedAt"
  `;
  return rows[0];
}

export async function updateBusinessDictionary(id: string, data: DictionaryData) {
  await ensureDictionaryCategory(data.category);
  const rows = await prisma.$queryRaw<BusinessDictionaryRow[]>`
    UPDATE "BusinessDictionary"
    SET
      "organizationId" = ${data.organizationId},
      category = CAST(${data.category} AS "DictionaryCategory"),
      name = ${data.name},
      value = ${data.value},
      enabled = ${data.enabled},
      "sortOrder" = ${data.sortOrder},
      "updatedAt" = now()
    WHERE id = ${id}
    RETURNING
      id,
      "organizationId",
      category::text AS category,
      name,
      value,
      enabled,
      "sortOrder",
      "createdAt",
      "updatedAt"
  `;
  return rows[0];
}
