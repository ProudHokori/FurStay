import { prisma } from "@/lib/prisma";

export const petRepository = {
  getByOwner(ownerId: string) {
    return prisma.pet.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
  },
  create(data: { ownerId: string; name: string; type: string; breed?: string; age?: number; notes?: string }) {
    return prisma.pet.create({ data });
  },
  delete(id: string, ownerId: string) {
    return prisma.pet.delete({ where: { id, ownerId } as never });
  },
};
