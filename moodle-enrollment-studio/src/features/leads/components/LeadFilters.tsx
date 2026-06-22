import { Dispatch, SetStateAction } from "react";
import { filterLeadsParams } from "../services/leadService";
import { LeadStatus } from "@repo/database";

interface LeadFiltersProps {
  filters: filterLeadsParams;
  setFilters: Dispatch<SetStateAction<filterLeadsParams>>;
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
}

export function LeadFilters({
  filters,
  setFilters,
  searchInput,
  setSearchInput,
}: LeadFiltersProps) {
  return (
    <div className="flex items-end gap-4 rounded-xl bg-card p-5 border border-border">
      {/* Usamos el espacio de campaña para otra cosa o lo dejamos estático por ahora */}
      <div>
        <div className="flex-1">
          <label className="lead-name">Nombre y apellidos</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="form-label">Campaña</label>
        <select className="form-select" disabled>
          <option>Todas las Campañas</option>
        </select>
      </div>
      {/* lead status */}
      <div className="flex-1">
        <label className="form-label">Estado</label>
        <select
          className="form-select"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value as LeadStatus })
          }
        >
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>

      <button
        className="btn-secondary whitespace-nowrap"
        onClick={() =>
          setFilters({ page: 1, status: "ACTIVE", limit: 10, search: "" })
        }
      >
        Limpiar Filtros
      </button>
    </div>
  );
}
