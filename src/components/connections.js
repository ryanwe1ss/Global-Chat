import {
  Box,
}
from '@mui/material';

function ClientView()
{
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 16px)',
        width: 'calc(20vw - 16px)',
        position: 'absolute',
        top: 8,
        right: 8,
        border: '1px solid #ccc',
        boxShadow: 2,
        borderRadius: '8px',
        padding: 1,
        boxSizing: 'border-box',
      }}
    >
      aaa
    </Box>
  );
}
export default ClientView;