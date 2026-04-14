"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <div
      className="rounded-app border border-app-strong bg-surface-2 p-4 shadow-app"
    >
      {editing ? (
        <form
          action={async (formData) => {
            await updatePetAction(null, formData);
            router.refresh();
            setEditing(false);
          }}
          className="space-y-3"
        >
          <input suppressHydrationWarning type="hidden" name="id" value={pet.id} />
          <Input suppressHydrationWarning name="name" defaultValue={pet.name} required />
          <Input suppressHydrationWarning name="type" defaultValue={pet.type} required />
          <Input suppressHydrationWarning name="breed" defaultValue={pet.breed ?? ""} placeholder="Breed" />
          <Input suppressHydrationWarning name="age" type="number" defaultValue={pet.age ?? ""} placeholder="Age" />
          <Textarea
            name="description"
            defaultValue={pet.description ?? ""}
            placeholder="Description, care notes, medication, temperament…"
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-[var(--radius-sm)] border px-4 py-2 text-sm transition hover:opacity-80"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--muted-foreground)",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--fur-dark)" }}>
              {pet.name}
            </h3>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {pet.type}
              {pet.breed ? ` · ${pet.breed}` : ""}
              {pet.age ? ` · ${pet.age} yr` : ""}
            </p>
            {pet.description && (
              <p className="mt-3 text-sm" style={{ color: "var(--foreground)" }}>
                {pet.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm underline transition hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
            >
              Edit
            </button>
            <form action={deletePetAction}>
              <input suppressHydrationWarning type="hidden" name="id" value={pet.id} />
              <button
                type="submit"
                className="text-sm transition hover:opacity-70"
                style={{ color: "var(--danger)" }}
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
