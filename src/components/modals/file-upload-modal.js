import { useState } from 'react';
import {
  Box,
  Modal,
  Button,
  Typography,
}
from '@mui/material';

import {
  CloudUpload as CloudUploadIcon,
}
from '@mui/icons-material';

function FileUploadModal(args)
{
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

    console.log(file);
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
              accept='image/*'
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
            fullWidth
          >
            <CloudUploadIcon sx={{ mr: 1 }} />{upload.text}
          </Button>
        </Box>
    </Modal>
  );
}
export default FileUploadModal;