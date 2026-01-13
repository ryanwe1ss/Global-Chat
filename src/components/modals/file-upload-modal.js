import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Modal,
  Button,
  Typography,
  Alert,
}
from '@mui/material';

import {
  CloudUpload as CloudUploadIcon,
}
from '@mui/icons-material';

import {
  ServerURL,
}
from '../../services/http-service';

function FileUploadModal(args)
{
  const fileRef = useRef(null);

  const [upload, setUpload] = useState({
    sending: false,
    text: 'Upload',
  });

  const [file, setFile] = useState({
    uploaded: false,
    content: null,
    name: null,
    size: null,
  });

  const [alert, setAlert] = useState({
    type: 'error',
    show: false,
    text: null,
  });

  useEffect(() => {
    if (!args.open) {
      setFile({
        uploaded: false,
        content: null,
        name: null,
        size: null,
      });

      setUpload({
        sending: false,
        text: 'Upload',
      });

      setAlert({
        type: 'error',
        show: false,
        text: null,
      });

      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }

  }, [args.open]);

  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    setFile({
      uploaded: true,
      name: file.name,
      size: file.size,
      content: file,
    });
  }

  const handleSendAttachment = () => {
    setUpload({ sending: true, text: 'Sending...' });

    const request = new XMLHttpRequest();
    const form = new FormData();

    form.append('file', file.content);
    request.open('POST', `${ServerURL}/api/upload`);
    request.withCredentials = true;

    request.onload = () => {
      const response = JSON.parse(request.responseText);

      switch (response.success)
      {
        case false:
          fileRef.current.value = '';

          setFile({
            uploaded: false,
            content: null,
            name: null,
            size: null,
          });

          setUpload({
            sending: false,
            text: 'Upload',
          });

          setAlert({
            text: response.message,
            type: 'error',
            show: true,
          });
          break;

        case true:
          args.setOpen(false);
          break;
      }

      setUpload({
        sending: false,
        text: 'Upload',
      });
    };

    request.send(form);
  }

  return (
    <Modal
        open={args.open}
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
            width: 400,
            p: 4,
          }}
        >
          <Typography
            variant='h6'
            component='h2'
            sx={{ borderBottom: '2px solid #CCC' }}
          >
            Upload Attachment
            <Button
              onClick={() => args.setOpen(false)}
              sx={{
                position: 'absolute',
                top: 30,
                right: 30,
                fontSize: '2rem',
                color: 'red',
                minWidth: 0,
                padding: 0,
                lineHeight: 1, 

                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'red',
                }
              }}
              variant='text'
            >
              &times;
            </Button>
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #ccc',
              borderRadius: 1,
              mt: 2,
              py: 1,
              px: 2,
              mb: 2,
            }}
          >
            <input
              style={{ display: 'none' }}
              onChange={handleUploadFile}
              accept='image/*, video/*'
              ref={fileRef}
              type='file'
            />

            <Button variant='outlined' component='span' size='small' onClick={() => document.querySelector('input[type="file"]').click()}>
              Choose file
            </Button>
            
            <Typography sx={{ ml: 2, fontSize: '0.9rem' }} noWrap>
              {file.uploaded ? file.name : 'No file chosen'}
            </Typography>
          </Box>

          <Button
            onClick={handleSendAttachment}
            disabled={!file.uploaded || upload.sending}
            variant='contained'
            sx={{ mb: -2 }}
            fullWidth
          >
            <CloudUploadIcon sx={{ mr: 1 }} />{upload.text}
          </Button>

          {alert.show && (
            <Alert
              severity={alert.type}
              sx={{ mt: 3, mb: -2 }}
            >
              {alert.text}
            </Alert>
          )}
        </Box>
    </Modal>
  );
}
export default FileUploadModal;