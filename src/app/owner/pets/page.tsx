import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPetAction, deletePetAction } from "@/lib/actions/owner-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function OwnerPetsPage() {
  const session = await requireRole(["OWNER"]);
  const pets = await prisma.pet.findMany({ where: { ownerId: session.sub }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell role="OWNER" name={session.name}>
      <h1 className="text-3xl font-bold">Pet profiles</h1>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Add a pet</h2>
        <form action={createPetAction} className="grid gap-3 md:grid-cols-2">
          <Input name="name" placeholder="Pet name" required />
          <Input name="type" placeholder="Type (Dog, Cat, etc.)" required />
          <Input name="breed" placeholder="Breed" />
          <Input name="age" type="number" placeholder="Age" />
          <div className="md:col-span-2"><Textarea name="notes" placeholder="Notes, food schedule, medication, temperament" /></div>
          <Button type="submit" className="md:col-span-2 w-fit">Create pet</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{pet.name}</h3>
                <p className="text-sm text-stone-500">{pet.type}{pet.breed ? ` · ${pet.breed}` : ""}</p>
                <p className="mt-3 text-sm text-stone-600">{pet.notes || "No notes yet"}</p>
              </div>
              <form action={deletePetAction}>
                <input type="hidden" name="id" value={pet.id} />
                <button className="text-sm text-red-600">Delete</button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
