import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/lib/creator-api";

interface SelectionContextType {
  selected: Product[];
  isSelected: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Product[]>([]);

  const isSelected = (id: string) => selected.some((p) => p.id === id);

  const toggle = (product: Product) =>
    setSelected((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );

  const remove = (id: string) => setSelected((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setSelected([]);

  return (
    <SelectionContext.Provider value={{ selected, isSelected, toggle, remove, clear }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
