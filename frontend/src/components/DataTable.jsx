import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportCsv, exportExcel, exportPdf } from "@/lib/exporters";

export const DataTable = ({
  columns, rows = [], searchKeys = [], title, filters = [], pageSize = 10,
  exportName = "leamse-export", selectable = true, testId = "data-table", toolbar = null,
  emptyLabel = "Nothing here yet", searchLabel = "Search",
}) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filterValue, setFilterValue] = useState("all");

  const filtered = useMemo(() => {
    let data = [...rows];
    if (query.trim()) {
      const q = query.toLowerCase();
      const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
      data = data.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
    }
    if (filterValue !== "all" && filters.length) {
      data = data.filter((r) => String(r[filters[0].key]) === filterValue);
    }
    if (sort.key) {
      data.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
        return sort.dir === "asc"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : String(bv ?? "").localeCompare(String(av ?? ""));
      });
    }
    return data;
  }, [rows, query, sort, filterValue, filters, searchKeys, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);
  const exportRows = selected.length ? filtered.filter((r) => selected.includes(r.id)) : filtered;

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <section data-testid={testId} className="ls-card overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-border p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title && <h2 className="font-display text-base font-semibold md:text-lg">{title}</h2>}
          <p className="ls-num mt-1 text-xs text-muted-foreground">
            {filtered.length} {selected.length ? `• ${selected.length} selected` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid={`${testId}-search`}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder={searchLabel}
              className="h-9 w-full rounded-full pl-9 sm:w-56"
            />
          </div>
          {filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-testid={`${testId}-filter`} variant="outline" size="sm" className="h-9 rounded-full">
                  {filterValue === "all" ? filters[0].label : filterValue}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterValue("all")}>All</DropdownMenuItem>
                {filters[0].options.map((o) => (
                  <DropdownMenuItem key={o} onClick={() => { setFilterValue(o); setPage(0); }}>
                    {o}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid={`${testId}-export`} variant="outline" size="sm" className="h-9 rounded-full">
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid={`${testId}-export-csv`} onClick={() => exportCsv(exportName, columns, exportRows)}>CSV</DropdownMenuItem>
              <DropdownMenuItem data-testid={`${testId}-export-xlsx`} onClick={() => exportExcel(exportName, columns, exportRows)}>Excel</DropdownMenuItem>
              <DropdownMenuItem data-testid={`${testId}-export-pdf`} onClick={() => exportPdf(exportName, columns, exportRows)}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="ls-scroll overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 ls-surface">
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    data-testid={`${testId}-select-all`}
                    checked={visible.length > 0 && visible.every((r) => selected.includes(r.id))}
                    onCheckedChange={(v) =>
                      setSelected(v ? Array.from(new Set([...selected, ...visible.map((r) => r.id)])) : [])
                    }
                  />
                </TableHead>
              )}
              {columns.map((c) => (
                <TableHead key={c.key} className="whitespace-nowrap text-xs uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {c.label}
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="py-14 text-center text-sm text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
            {visible.map((row) => (
              <TableRow key={row.id} data-testid={`${testId}-row`} className="ls-lift">
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onCheckedChange={(v) =>
                        setSelected((s) => (v ? [...s, row.id] : s.filter((x) => x !== row.id)))
                      }
                    />
                  </TableCell>
                )}
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.numeric ? "ls-num whitespace-nowrap" : "whitespace-nowrap"}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-border p-4">
        <span className="ls-num text-xs text-muted-foreground">
          Page {current + 1} / {pages}
        </span>
        <div className="flex gap-2">
          <Button data-testid={`${testId}-prev`} variant="outline" size="sm" className="rounded-full"
                  disabled={current === 0} onClick={() => setPage(current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button data-testid={`${testId}-next`} variant="outline" size="sm" className="rounded-full"
                  disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </section>
  );
};
