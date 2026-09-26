import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export const KpiCard = ({ label, value, hint, delta, icon: Icon, index = 0, testId }) => (
  <motion.div
    data-testid={testId}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    className="ls-card ls-lift p-6"
  >
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {Icon && (
        <span className="rounded-xl bg-accent p-2 text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
    </div>
    <p className="ls-num mt-4 font-display text-2xl font-extrabold sm:text-3xl">{value}</p>
    <div className="mt-2 flex items-center gap-2">
      {typeof delta === "number" && (
        <span
          className={`ls-num inline-flex items-center gap-1 text-xs font-medium ${
            delta >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"
          }`}
        >
          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      )}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  </motion.div>
);
