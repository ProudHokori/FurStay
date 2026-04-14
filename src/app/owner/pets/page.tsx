import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PetCard } from "./pet-card";
import { createPetAction } from "@/lib/actions/owner-actions";
import { petRepository } from "@/lib/repositories/pet-repository";
import { requireRole } from "@/lib/session";

async function addPetAction(formData: FormData) {
  "use server";
  await createPetAction(null, formData);
}

export default async function OwnerPetsPage() {
  const session = await requireRole(["OWNER"]);
  const pets = await petRepository.getByOwner(session.sub);
  return (
    <AppShell role="OWNER" name={session.name}>
      <PageHeader
        title="Pet profiles"
        description="Add and manage your pets. Their profiles will be shown to sitters when you post a job."
      />
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Add a pet</h2>
        <form action={addPetAction} className="grid gap-3 md:grid-cols-2">
          <Input suppressHydrationWarning name="name" placeholder="Pet name" required />
          <Input suppressHydrationWarning name="type" placeholder="Type (Dog, Cat, etc.)" required />
          <Input suppressHydrationWarning name="breed" placeholder="Breed" />
          <Input suppressHydrationWarning name="age" type="number" placeholder="Age" />
          <div className="md:col-span-2">
            <Textarea name="description" placeholder="Description, care notes, medication, temperament…" />
          </div>
          <Button type="submit" className="md:col-span-2 w-fit">Add pet</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {pets.length === 0 && <p className="text-sm text-stone-400 md:col-span-2">No pets yet. Add your first pet above.</p>}
        {pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
      </div>
    </AppShell>
  );
}
