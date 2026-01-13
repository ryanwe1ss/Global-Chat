import {
  Box,
  Modal,
}
from '@mui/material';

import {
  ServerURL,

} from '../../services/http-service';

function AttachmentModal(args)
{
  const handleClose = () => {
    args.setAttachment({
      open: false,
      stored_name: null,
      original_name: null,
    });
  };

  return (
    <Modal
        open={args.data.open}
        onClose={handleClose}
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
          <img
            src={`${ServerURL}/api/attachment?attachment=${args.data.stored_name}`}
            alt={args.data.original_name}
            style={{
              maxWidth: '80vw',
              maxHeight: '60vh',
              borderRadius: '8px',
            }}
          />
        </Box>
    </Modal>
  );
}
export default AttachmentModal;