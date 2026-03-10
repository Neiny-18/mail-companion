import type { Category } from "@/data/mockEmails";
import { getEmailsByCategory } from "@/data/mockEmails";
import { EmailRow } from "./EmailRow";

export function CategoryGroup({ category }: { category: Category }) {
  const emails = getEmailsByCategory(category);

  return (
    <section className="border-b border-border">
      <div className="px-6 py-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-widest font-sans">
          {category}
        </h2>
      </div>
      {emails.length === 0 ? (
        <div className="px-6 py-3">
          <span className="font-mono text-xs text-muted-foreground">None.</span>
        </div>
      ) : (
        emails.map((email) => <EmailRow key={email.id} email={email} />)
      )}
    </section>
  );
}
