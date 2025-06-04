import { useEffect, useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,

} from '@mui/material';
import {
  FileUpload as FileUploadIcon,

} from '@mui/icons-material';

import {
  HttpRequest,
  ServerURL,

} from '../services/http-service';

function MessageBox(args)
{
  const [message, setMessage] = useState(null);
  const [limit, setLimit] = useState(50);
  
  const [isAtTop, setIsAtTop] = useState(false);
  const hasScrolledInitially = useRef(false);
  const messageContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [data, setData] = useState({
    messages: [],
    count: 0,
  });

  const [messageAction, setMessageSendAction] = useState({
    buttonEnabled: true,
    boxEnabled: true,
    text: 'Send',
  });

  const [alert, setAlert] = useState({
    severity: 'error',
    message: null,
    open: false,
  });

  useEffect(() => {
    if (args.user.username) {
      HttpRequest('/api/messages', { limit }).then(response => {
        setData({
          messages: response.data.messages || [],
          count: parseInt(response.data.count),
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
      if (args.receivedMessage.attachment && typeof args.receivedMessage.attachment === 'string') {
        args.receivedMessage.attachment = {
          stored_name: args.receivedMessage.attachment,
          original_name: args.receivedMessage.original_name || 'attachment',
        };
      }

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

  useEffect(() => {
    if (!hasScrolledInitially.current && messagesEndRef.current && data.messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      hasScrolledInitially.current = true;
    }
    
  }, [data.messages]);

  const handleSendMessage = async () => {
    setAlert({ ...alert, open: false });
    setMessageSendAction({
      buttonEnabled: false,
      boxEnabled: false,
      text: 'Sending...',
    });

    const response = await HttpRequest('/api/send-message', { message });
    if (!response.success) {
      setAlert({
        message: response.message,
        severity: 'error',
        open: true,
      });
    }

    setMessage(null);
    setMessageSendAction({
      buttonEnabled: true,
      boxEnabled: true,
      text: 'Send',
    });
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop } = messageContainerRef.current;
      
      if (scrollTop === 0 && !isAtTop && data.count !== data.messages.length) {
        setLimit(limit + 50);
        setIsAtTop(true);
        
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
                <div>
                  {
                    row.message ? row.message :
                      <Box>
                        <img
                          src={`${ServerURL}/api/attachment?attachment=${row.attachment.stored_name}`}
                          alt={row.original_name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '180px',
                            borderRadius: '8px',
                            marginBottom: '-4px',
                          }}
                        />
                      </Box>
                  }
                </div>
              </Box>
            </Box>
          </Box>
        ))}

        <div ref={messagesEndRef} />
      </Box>

      {alert.open && (
        <Alert severity={alert.severity}>
          {alert.message}
        </Alert>
      )}

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
          disabled={!messageAction.boxEnabled}
          placeholder='Type a message...'
          value={message || ''}
          variant='outlined'
          size='small'
          fullWidth
        />
        
        <Button
          disabled={!message || !messageAction.buttonEnabled}
          onClick={handleSendMessage}
          variant='contained'
          color='primary'
          sx={{ ml: 2 }}
        >
          {messageAction.text}
        </Button>

        <Button
          disabled={!messageAction.buttonEnabled}
          onClick={() => args.openFileUpload(true)}
          variant='outlined'
          color='primary'
          sx={{ ml: 1 }}
        >
          <FileUploadIcon />
        </Button>
      </Box>
    </Box>
  );
}
export default MessageBox;