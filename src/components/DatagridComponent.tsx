import React, { useState, useEffect, useContext } from 'react';
import { DataGrid, type GridRowSelectionModel, type GridRowId, type GridColDef } from '@mui/x-data-grid';
import {
  TextField, Box, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { UserContext } from '../App';

interface DatagridComponentProps {
  rows: any[];
  columns: GridColDef[];
  sx?: object;
  autoHeight?: boolean;
  onRowsChange?: (newRows: any[]) => void;
  onDeleteRows?: (ids: GridRowId[]) => Promise<void>;
  onEditRow?: (id: GridRowId) => void;
  onAddRow?: () => void;
  addButtonLabel?: string;
  showOpenButton?: boolean;
  onOpenRow?: (id: GridRowId) => void;
  onRowClick?: (id: GridRowId) => void;
  [key: string]: any;
}

const DatagridComponent: React.FC<DatagridComponentProps> = (props) => {
  const { user } = useContext(UserContext);

  const {
    rows: initialRows = [],
    columns,
    sx,
    autoHeight = true,
    onRowsChange,
    onDeleteRows,
    onEditRow,
    onAddRow,
    addButtonLabel,
    showOpenButton = false,
    onOpenRow,
    onRowClick,
    ...rest
  } = props;

  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>()
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<GridRowId[]>([]);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const filteredRows = rows.filter((row: any) =>
    columns?.some((col: any) =>
      String(row[col.field] ?? '').toLowerCase().includes(filter.toLowerCase())
    )
  );

  const handleDelete = () => {
    const ids = selectionModel.type === 'include'
      ? Array.from(selectionModel.ids)
      : rows.filter((r) => !selectionModel.ids.has(r.id)).map((r) => r.id);
    if (ids.length === 0) return;
    setIdsToDelete(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteRows) return;
    try {
      setLoading(true);
      await onDeleteRows(idsToDelete);
      const remainingRows = rows.filter((row) => !idsToDelete.includes(row.id));
      setRows(remainingRows);
      setSelectionModel({ type: 'include', ids: new Set() });
      if (onRowsChange) onRowsChange(remainingRows);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const selectedId = selectionModel.type === 'include'
    ? Array.from(selectionModel.ids)[0]
    : rows.find((r) => !selectionModel.ids.has(r.id))?.id;

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
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Hae..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading}
            sx={{ width: 300 }}
          />
          {user && onAddRow && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddRow}
              disabled={loading}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
            >
              {addButtonLabel || 'Lisää uusi'}
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {showOpenButton && selectedCount === 1 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<OpenInFullIcon />}
              disabled={loading}
              onClick={() => selectedId && onOpenRow?.(selectedId)}
            >
              Avaa
            </Button>
          )}
          {user && selectedCount === 1 && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => selectedId && onEditRow?.(selectedId)}
            >
              Muokkaa
            </Button>
          )}
          {user && selectedCount > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
            >
              Poista ({selectedCount})
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
        onRowClick={(params) => {
          if (onRowClick) onRowClick(params.id);
        }}
        onRowSelectionModelChange={(newModel) => setSelectionModel(newModel as GridRowSelectionModel)}
        rowSelectionModel={selectionModel}
        sx={{ 
          width: '100%', 
          cursor: onRowClick ? 'pointer' : 'default',
          '& .MuiDataGrid-row:hover': {
            bgcolor: onRowClick ? 'action.hover' : 'inherit',
          },
          ...(typeof sx === 'object' ? sx : {}) 
        }}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Vahvista poisto</DialogTitle>
        <DialogContent>Haluatko varmasti poistaa valitut kohteet?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Peruuta</Button>
          <Button color="error" onClick={handleConfirmDelete}>Poista</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatagridComponent;