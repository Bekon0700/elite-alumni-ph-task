"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { isActionError } from "@/lib/action-result";
import { addMemberToProject } from "../actions";

interface Props {
  projectId: string;
  onSuccess?: () => void;
}

export function AddMemberDialog({ projectId, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addMemberToProject(projectId, email);
      if (isActionError(result)) {
        toast.error(result.error);
      } else {
        toast.success("Member added successfully");
        setEmail("");
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Member Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="member@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Enter the email of an existing user</p>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Adding..." : "Add Member"}
      </Button>
    </form>
  );
}
