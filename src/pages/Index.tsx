import { DailySummary } from "@/components/DailySummary";
import { CategoryGroup } from "@/components/CategoryGroup";
import { categories } from "@/data/mockEmails";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        {/* App header */}
        <div className="px-6 pt-8 pb-2">
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Triage
          </p>
        </div>

        {/* Daily summary */}
        <DailySummary />

        {/* Email list by category */}
        <main>
          {categories.map((cat) => (
            <CategoryGroup key={cat} category={cat} />
          ))}
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="font-mono text-xs text-muted-foreground/50">
            End of day. 14 emails processed.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
