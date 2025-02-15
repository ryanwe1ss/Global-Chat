import RouterIcon from '@mui/icons-material/Router';
import {
  Box,
  Typography,
}
from '@mui/material';

function ClientView(args)
{
  return (
    <>
      <Typography sx={{ float: 'right', mr: 1, mt: 0.5 }}>
        ({args.users.length})
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 16px)',
          width: 'calc(20vw - 16px)',
          position: 'absolute',
          top: 8,
          right: 8,
          border: '1px solid #CCC',
          boxShadow: 2,
          borderRadius: '8px',
          padding: 1,
          boxSizing: 'border-box',
          overflow: 'auto',
        }}
      >
        {args.users && args.users.map((username, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 0.5 }}>
            <RouterIcon />
            <Typography
              sx={{ mt: 0.4 }}
            >
              {username}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
export default ClientView;