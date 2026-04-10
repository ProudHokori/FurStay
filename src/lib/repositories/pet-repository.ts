import { prisma } from "@/lib/prisma";

export const petRepository = {
  getByOwner(ownerId: string) {
    return prisma.pet.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
  },

  create(data: { ownerId: string; name: string; type: string; breed?: string; age?: number; description?: string }) {
    return prisma.pet.create({ data });
  },

  update(id: string, ownerId: string, data: { name?: string; type?: string; breed?: string; age?: number; description?: string }) {
    return prisma.pet.updateMany({ where: { id, ownerId }, data });
  },

  delete(id: string, ownerId: string) {
    return prisma.pet.deleteMany({ where: { id, ownerId } });
  },
};
