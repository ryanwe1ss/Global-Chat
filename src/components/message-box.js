import { useEffect, useState, useRef } from 'react';
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
  const [message, setMessage] = useState(null);
  const [limit, setLimit] = useState(10);
  
  const [isAtTop, setIsAtTop] = useState(false);
  const messageContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [data, setData] = useState({
    messages: [],
    count: 0,
  });

  useEffect(() => {
    if (args.user.username) {
      HttpRequest('/api/messages', { limit }).then(response => {
        response.data.messages.sort((a, b) => a.id - b.id);

        setData({
          messages: response.data.messages || [],
          count: response.count,
        });

        args.setLogin({
          username: null,
          password: null,
          loading: false,
          open: false,
        });
      });
    }

  }, [args.user, limit]);

  useEffect(() => {
    if (args.receivedMessage) {
      setData({
        ...data,
        messages: [
          ...data.messages,
          args.receivedMessage,
        ],
      });
    }

  }, [args.receivedMessage]);

  useEffect(() => {
    if (limit === 10) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

  }, [data.messages]);

  const handleSendMessage = async () => {
    const response = await HttpRequest('/api/send-message', { message });
    setMessage(null);
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop } = messageContainerRef.current;
      
      if (scrollTop === 0 && !isAtTop) {
        setIsAtTop(true);
        setLimit(limit + 25);
      } else if (scrollTop > 0 && isAtTop) {
        setIsAtTop(false);
      }
    }
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
        ref={messageContainerRef}
        onScroll={handleScroll}
        sx={{
          backgroundColor: '#f9f9f9',
          overflowY: 'auto',
          padding: 1,
          flex: 1,
        }}
      >
        {args.user.username && data.messages.length > 0 && data.messages.map((row, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography 
              sx={{ 
                fontSize: 12, 
                fontWeight: 'bold', 
                color: 'gray', 
                textAlign: row.your_message ? 'right' : 'left' 
              }}
            >
              {args.user.username !== row.sender.username && row.sender.username}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: row.your_message ? 'flex-end' : 'flex-start',
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
          </Box>
        ))}

        <div ref={messagesEndRef} />
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