import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';

import {
  HttpRequest,
}
from './services/http-service';

import MessageBox from './components/message-box';
import ClientView from './components/connections';

function App()
{
  const [receivedMessage, setReceivedMessage] = useState(null);
  const passwordRef = useRef(null);

  const [user, setUser] = useState({
    username: null,
    name: null,
    date_created: null,
  });

  const [login, setLogin] = useState({
    username: null,
    password: null,
    loading: false,
    open: false,
  });

  const [alert, setAlert] = useState({
    severity: 'error',
    message: null,
    open: false,
  });

  useEffect(() => {
    if (user.username) {
      const socket = new WebSocket('ws://localhost:10000');

      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        setReceivedMessage({
          ...data,
          your_message: data.sender.username === user.username,
        });
      });

      socket.addEventListener('close', () => {
        setUser({ username: null, name: null, date_created: null });
        setLogin({ ...login, open: true });
      });
    }

  }, [user]);

  useEffect(() => {
    HttpRequest('/api/session').then(response => {
      if (response.session) {
        setUser({
          username: response.session.username,
          name: response.session.name,
          date_created: response.session.date_created,
        });
      
      } else setLogin({ ...login, open: true });
    });

  }, []);

  const handleLogin = async () => {
    const body = {
      username: login.username,
      password: login.password,
    };

    setLogin({ ...login, loading: true });
    const response = await HttpRequest('/api/login', body);

    switch (response.token)
    {
      case null:
        passwordRef.current.select();
        break;

      default:
        setUser({
          username: response.session?.username,
          name: response.session?.name,
          date_created: response.session?.date_created,
        });
        break
    }

    setLogin({ ...login, loading: false });
    setAlert({
      open: true,
      severity: response.success ? 'success' : 'error',
      message:
        response.success === undefined ? 'Server Error. Contact an Administrator' :
        response.success === false ? 'Login failed, try again' :
        response.message,
    });
  };

  return (
    <>
      <MessageBox user={user} receivedMessage={receivedMessage} setLogin={setLogin} />
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
            onChange={e => setLogin({ ...login, username: e.target.value })}
            fullWidth={true}
            label='Username'
            variant='outlined'
            size='small'
            sx={{ mt: 2 }}
          />

          <TextField
            onChange={e => setLogin({ ...login, password: e.target.value })}
            inputRef={passwordRef}
            fullWidth={true}
            label='Password'
            variant='outlined'
            size='small'
            type='password'
            sx={{ mt: 2 }}
          />

          <Button
            disabled={login.loading}
            onClick={handleLogin}
            variant='contained'
            color='primary'
            sx={{ mt: 2 }}
          >
            {login.loading ? 'Logging In...' : 'Login'}
          </Button>

          {alert.open && (
            <Alert
              severity={alert.severity}
              sx={{ mt: 1.5, mb: -2.5 }}
            >
              {alert.message}
            </Alert>
          )}
        </Box>
      </Modal>
    </>
  );
}
export default App;