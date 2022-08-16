import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

const columns = [
  { field: 'nft', headerName: 'NFT_address', width: 300 },
  { field: 'owner', headerName: 'Owner adress', width: 300 },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    width: 90,
  },
  {
    field: 'interest',
    headerName: 'Interest',
    type: 'number',
    width: 90,
  },
  {
    field: "action",
    headerName: "Action",
    sortable: false,
    renderCell: (params) => {
      const onClick = (e) => {
        e.stopPropagation(); // don't select this row after clicking

        const api = params.api;
        const thisRow = {};

        api
          .getAllColumns()
          .filter((c) => c.field !== "__check__" && !!c)
          .forEach(
            (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
          );

        return alert(JSON.stringify(thisRow, null, 4));
      };

      return <Button onClick={onClick}>Click</Button>;
    }
  },
];



export const DataTable= (props) => {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={props.rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
