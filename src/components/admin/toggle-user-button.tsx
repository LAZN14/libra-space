"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminToggleUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ToggleUserButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant={isActive ? "danger" : "secondary"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminToggleUser(userId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      {isActive ? "Блок" : "Разблок"}
    </Button>
  );
}
