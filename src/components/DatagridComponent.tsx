import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Box } from '@mui/material';

type DatagridComponentProps = React.ComponentProps<typeof DataGrid>;

const DatagridComponent: React.FC<DatagridComponentProps> = ({ rows, columns, sx, autoHeight = true, ...rest }) => {
  const [filter, setFilter] = useState('');

  const filteredRows = rows?.filter((row: any) =>
    columns?.some((col: any) =>
      String(row[col.field]).toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div style={{ width: '100%' }}>
      <Box sx={{ mb: 1 }}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Hae..."
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>
      <DataGrid
        autoHeight={autoHeight}
        rows={filteredRows}
        columns={columns}
        sx={{
          width: '100%',
          ...(typeof sx === 'object' && sx ? sx : {}),
        }}
        {...rest}
      />
    </div>
  );
};

export default DatagridComponent;