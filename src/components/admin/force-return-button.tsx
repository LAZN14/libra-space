"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminForceReturn } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ForceReturnButton({ loanId }: { loanId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminForceReturn(loanId);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      Закрыть
    </Button>
  );
}
