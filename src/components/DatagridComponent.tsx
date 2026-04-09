import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridRowSelectionModel,
  GridRowId,
  GridColDef
} from '@mui/x-data-grid';
import { TextField, Box, Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

interface DatagridComponentProps {
  rows: any[];
  columns: GridColDef[];
  sx?: object;
  autoHeight?: boolean;
  onRowsChange?: (newRows: any[]) => void;
  onDeleteRows?: (ids: GridRowId[]) => Promise<void>;
  [key: string]: any;
}

const DatagridComponent: React.FC<DatagridComponentProps> = ({
  rows: initialRows = [],
  columns,
  sx,
  autoHeight = true,
  onRowsChange,
  onDeleteRows,
  showOpenButton = false,
  onOpenRow,
  ...rest
}) => {
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>()
  });

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const filteredRows = rows.filter((row: any) =>
    columns?.some((col: any) =>
      String(row[col.field] ?? '').toLowerCase().includes(filter.toLowerCase())
    )
  );

  const handleDelete = async () => {
    const idsToDelete = selectionModel.type === 'include'
      ? Array.from(selectionModel.ids)
      : rows.filter((r) => !selectionModel.ids.has(r.id)).map((r) => r.id);

    if (onDeleteRows) {
      try {
        setLoading(true);
        await onDeleteRows(idsToDelete);

        const remainingRows = rows.filter((row) => !idsToDelete.includes(row.id));
        setRows(remainingRows);
        setSelectionModel({ type: 'include', ids: new Set() });

        if (onRowsChange) onRowsChange(remainingRows);
      } catch (error) {
        console.error("Delete error:", error);
        alert("Poisto epäonnistui.");
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedCount = selectionModel.type === 'include'
    ? selectionModel.ids.size
    : rows.length - selectionModel.ids.size;

  return (
    <Box sx={{ width: '100%' }}>
      <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <TextField
            size="small"
            placeholder="Hae..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading}
            sx={{ width: 300 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {showOpenButton && selectedCount === 1 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <OpenInFullIcon />
                }
                disabled={loading}
                onClick={() => {
                  const selectedId =
                    selectionModel.type === 'include'
                      ? Array.from(selectionModel.ids)[0]
                      : rows.find((r) => !selectionModel.ids.has(r.id))?.id;

                  if (selectedId && onOpenRow) {
                    onOpenRow(selectedId);
                  }
                }}
              >
                {loading ? 'Avataan...' : 'Avaa'}
              </Button>
            )}

            {selectedCount > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Poistetaan...' : `Poista (${selectedCount})`}
              </Button>
            )}
          </Box>
        </Box>

      <DataGrid
        {...rest}
        rows={filteredRows}
        columns={columns}
        autoHeight={autoHeight}
        checkboxSelection
        disableRowSelectionOnClick
        loading={loading}
        onRowSelectionModelChange={(newModel) => {
          setSelectionModel(newModel as GridRowSelectionModel);
        }}
        rowSelectionModel={selectionModel}
        sx={{
          width: '100%',
          ...(typeof sx === 'object' ? sx : {}),
        }}
      />
    </Box>
  );
};

export default DatagridComponent;