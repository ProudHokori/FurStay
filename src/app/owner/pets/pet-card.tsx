"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updatePetAction, deletePetAction } from "@/lib/actions/owner-actions";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  description: string | null;
};

export function PetCard({ pet }: { pet: Pet }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      {editing ? (
        <form
          action={async (formData) => {
            await updatePetAction(null, formData);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <input suppressHydrationWarning type="hidden" name="id" value={pet.id} />
          <Input suppressHydrationWarning name="name" defaultValue={pet.name} required />
          <Input suppressHydrationWarning name="type" defaultValue={pet.type} required />
          <Input suppressHydrationWarning name="breed" defaultValue={pet.breed ?? ""} placeholder="Breed" />
          <Input suppressHydrationWarning name="age" type="number" defaultValue={pet.age ?? ""} placeholder="Age" />
          <Textarea name="description" defaultValue={pet.description ?? ""} placeholder="Description, care notes, medication, temperament…" />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{pet.name}</h3>
            <p className="text-sm text-stone-500">{pet.type}{pet.breed ? ` · ${pet.breed}` : ""}{pet.age ? ` · ${pet.age} yr` : ""}</p>
            {pet.description && <p className="mt-3 text-sm text-stone-600">{pet.description}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-sm text-stone-600 underline">Edit</button>
            <form action={deletePetAction}>
              <input suppressHydrationWarning type="hidden" name="id" value={pet.id} />
              <button type="submit" className="text-sm text-red-600">Delete</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
