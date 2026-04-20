import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type {
  GridRowSelectionModel,
  GridRowId,
  GridColDef
} from '@mui/x-data-grid';

import {
  TextField,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EditIcon from '@mui/icons-material/Edit';

import { useContext } from 'react';
import { UserContext } from '../App';

interface DatagridComponentProps {
  rows: any[];
  columns: GridColDef[];
  sx?: object;
  autoHeight?: boolean;
  onRowsChange?: (newRows: any[]) => void;
  onDeleteRows?: (ids: GridRowId[]) => Promise<void>;
  onEditRow?: (id: GridRowId) => void;
  showOpenButton?: boolean;
  onOpenRow?: (id: GridRowId) => void;
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
    showOpenButton = false,
    onOpenRow,
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
      alert("Poisto epäonnistui.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const selectedId =
    selectionModel.type === 'include'
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
                loading
                  ? <CircularProgress size={20} color="inherit" />
                  : <OpenInFullIcon />
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
              startIcon={
                loading
                  ? <CircularProgress size={20} color="inherit" />
                  : <DeleteIcon />
              }
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Vahvista poisto</DialogTitle>
        <DialogContent>
          Haluatko varmasti poistaa?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Peruuta
          </Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Poista
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatagridComponent;