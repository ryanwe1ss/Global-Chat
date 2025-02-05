import { useEffect } from 'react';
import {
  Box,
  TextField,
  Button,

} from '@mui/material';
import { HttpRequest } from '../services/http-service';

function MessageBox(args)
{
  useEffect(() => {
    if (args.user.username) {
      HttpRequest('/api/messages').then(response => {
        console.log(response);

        args.setLogin({
          username: null,
          password: null,
          loading: false,
          open: false,
        });
      });
    }

  }, [args.user]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 16px)',
        width: 'calc(80vw - 16px)',
        position: 'absolute',
        top: 8,
        left: 8,
        border: '1px solid #ccc',
        boxShadow: 2,
        borderRadius: '8px',
        padding: 1,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 1,
          backgroundColor: '#f9f9f9',
        }}
      >
        <p>Message 1</p>
        <p>Message 2</p>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: 2,
          borderTop: '1px solid #ccc',
          backgroundColor: '#fff',
        }}
      >
        <TextField
          fullWidth
          placeholder='Type a message...'
          variant='outlined'
          size='small'
        />
        
        <Button
          variant='contained'
          color='primary'
          sx={{ marginLeft: 2 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
export default MessageBox;