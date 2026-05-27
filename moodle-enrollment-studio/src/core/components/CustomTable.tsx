import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Button } from "@/core/components/ui/button";

interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

export function CustomTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: CustomTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5, // Registros por página cómodos para móvil
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* 🌟 ENVOLTORIO MÁGICO: Rompe el scroll en móvil y dibuja las tarjetas */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden w-full">
        <table className="block md:table w-full border-collapse">
          
          {/* Cabecera: Oculta en móviles, limpia en escritorio */}
          <thead className="hidden md:table-header-group bg-slate-50/75 border-b border-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="md:table-row">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="md:table-cell text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Cuerpo: Apilado vertical en celulares, celdas planas en escritorio */}
          <tbody className="block md:table-row-group w-full divide-y divide-slate-100">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`block md:table-row p-4 bg-white hover:bg-slate-50/50 transition-colors space-y-2.5 md:space-y-0 md:p-0 group ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Jalamos el texto del header para usarlo de Label dinámico en móviles
                    const headerLabel = cell.column.columnDef.header;

                    return (
                      <td
                        key={cell.id}
                        className="flex justify-between items-center md:table-cell px-1 md:px-4 py-1 md:py-3.5 text-sm text-slate-700 border-b border-dashed border-slate-100 last:border-0 md:border-b-0"
                      >
                        {/* 📱 Label izquierdo exclusivo para móviles (Ej: Nombre, Email) */}
                        <span className="md:hidden font-medium text-xs text-slate-400 uppercase tracking-wide mr-4">
                          {typeof headerLabel === "string" ? headerLabel : ""}
                        </span>

                        {/* Valor del dato cargado a la derecha en móvil, a la izquierda en PC */}
                        <div className="text-right md:text-left font-medium md:font-normal truncate max-w-[200px] md:max-w-none">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr className="block md:table-row">
                <td
                  colSpan={columns.length}
                  className="block md:table-cell h-24 text-center text-sm text-slate-400 py-8"
                >
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación minimalista inferior adaptada a móviles */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-400 font-medium">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs px-3"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs px-3"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}