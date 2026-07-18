import { Construction } from "lucide-react";

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Construction size={26} />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        This module is part of the affiliate platform roadmap and will be delivered in an
        upcoming sprint.
      </p>
    </div>
  );
}
