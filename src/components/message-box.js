import { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,

} from '@mui/material';

import {
  HttpRequest,

} from '../services/http-service';

function MessageBox(args)
{
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (args.user.username) {
      HttpRequest('/api/messages').then(response => {
        setMessages(response.messages || []);
        args.setLogin({
          username: null,
          password: null,
          loading: false,
          open: false,
        });
      });
    }

  }, [args.user]);

  useEffect(() => {
    if (args.receivedMessage) {
      setMessages([
        ...messages,
        args.receivedMessage,
      ]);
    }

  }, [args.receivedMessage]);

  const handleSendMessage = async () => {
    const response = await HttpRequest('/api/send-message', { message });
    setMessage(null);
  };

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
          backgroundColor: '#f9f9f9',
          overflowY: 'auto',
          padding: 1,
          flex: 1,
        }}
      >
        {args.user.username && messages.length > 0 && messages.map((row, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: row.your_message ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                p: 2,
                borderRadius: 2,
                bgcolor: row.your_message ? '#1976d2' : '#e0e0e0',
                color: row.your_message ? 'white' : 'black',
                wordBreak: 'break-word',
              }}
            >
              <Typography>{row.message}</Typography>
            </Box>
          </Box>
        ))}
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
          onChange={(event) => setMessage(event.target.value)}
          placeholder='Type a message...'
          value={message || ''}
          variant='outlined'
          size='small'
          fullWidth
        />
        
        <Button
          disabled={!message}
          onClick={handleSendMessage}
          variant='contained'
          color='primary'
          sx={{ ml: 2 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
export default MessageBox;