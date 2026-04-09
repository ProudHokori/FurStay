"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createJobAction } from "@/lib/actions/owner-actions";

type Pet = { id: string; name: string };

export function NewJobForm({ pets }: { pets: Pet[] }) {
  const [state, action, pending] = useActionState(createJobAction, null);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      {state?.error && (
        <p className="md:col-span-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <Select name="petId" required defaultValue="">
        <option value="" disabled>Select a pet</option>
        {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
      </Select>
      <Input name="title" placeholder="Job title" required />
      <div className="md:col-span-2">
        <Textarea name="description" placeholder="Describe the work, schedule, feeding, walking, medication, etc." required />
      </div>
      <Input name="location" placeholder="Location" />
      <Input name="paymentAmount" type="number" min="1" step="any" placeholder="Payment amount" required />
      <Input name="startDate" type="datetime-local" required />
      <Input name="endDate" type="datetime-local" required />
      <Button type="submit" disabled={pending} className="md:col-span-2 w-fit">
        {pending ? "Creating..." : "Create job"}
      </Button>
    </form>
  );
}
