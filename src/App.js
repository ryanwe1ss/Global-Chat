import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

import MessageBox from './components/message-box';
import ClientView from './components/connections';

function App()
{
  const [login, setLogin] = useState({
    loading: false,
    open: true,
  });

  return (
    <>
      <MessageBox />
      <ClientView />

      <Modal
        open={login.open}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            overflow: 'auto',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            variant='h6'
            component='h2'
            sx={{ borderBottom: '2px solid #CCC' }}
          >
            Global Chat Authentication
          </Typography>

          <TextField
            fullWidth={true}
            label='Username'
            variant='outlined'
            size='small'
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth={true}
            label='Password'
            variant='outlined'
            size='small'
            type='password'
            sx={{ mt: 2 }}
          />

          <Button
            variant='contained'
            color='primary'
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Modal>
    </>
  );
}
export default App;