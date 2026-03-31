import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

type DatagridComponentProps = React.ComponentProps<typeof DataGrid>;

const DatagridComponent: React.FC<DatagridComponentProps> = (props) => {
  const { autoHeight = true, slots, sx, ...rest } = props;

  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        autoHeight={autoHeight}
        slots={{
          toolbar: GridToolbar,
          ...(slots || {}),
        }}
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