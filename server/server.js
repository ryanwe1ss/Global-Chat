const { middleware } = require('./middleware/middleware');
const { database } = require('./database');
const listener = require('./listener');

const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const formidable = require('formidable');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const api = express();
const usersConnected = [];
const maxUploadSize = 10 * 1024 * 1024; // 10 MB

api.use(express.json());
api.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));
api.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'token',
  cookie: {
    maxAge: 3600000,
  },
}));

api.post('/api/session', function(request, result) {
  switch (request.session.user)
  {
    case undefined:
      return result.status(401).send({
        success: false,
        message: 'Session not found',
      });

    default:
      return result.status(200).send({
        success: true,
        users: usersConnected,
        session: {
          username: request.session.user.username,
          name: request.session.user.name,
          date_created: request.session.user.date_created,
        },
      }
    );
  }
});

api.post('/api/login', function(request, result) {
  if (!request.body.username || !request.body.password) {
    return result.status(400).send({
      success: false,
      message: 'You must provide a Username and Password',
    });
  }

  const decrypted = crypto
    .createHash('sha256')
    .update(request.body.password)
    .digest('hex');

  database.query(`
    SELECT
      u.id,
      u.name,
      u.username,
      u.date_created,
      json_build_object(
        'id', r.id,
        'name', r.name
      ) AS role
    FROM
      users u
    LEFT JOIN
      roles r ON r.id = u.role_id
    WHERE
      u.username = $1 AND
      u.password = $2
  `,
    [
      request.body.username,
      decrypted,
    ],

  (error, results) => {
    if (error) {
      return result.status(500).send({
        success: false,
        message: 'Login Failed. Contact an Administrator',
      });
    }

    if (results.rows.length > 0) {
      request.session.user = {
        id: results.rows[0].id,
        name: results.rows[0].name,
        role: results.rows[0].role.name,
        username: request.body.username,
        date_created: results.rows[0].date_created,
      };
      
      request.session.save();
      usersConnected.push(request.body.username);

      return result.status(200).send({
        success: true,
        message: 'Authenticating...',
        users: usersConnected,
        session: {
          username: request.body.username,
          name: results.rows[0].name,
          role: results.rows[0].role.name,
          date_created: results.rows[0].date_created,
        },
      });
    
    } else {
      return result.status(401).send({
        success: false,
        token: null,
        message: 'Login failed, try again',
      });
    }
  });
});

api.post('/api/messages', middleware, function(request, result) {
  const limit = request.body.limit || 10;
  database.query(`
    SELECT 
      (SELECT COUNT(*) FROM messages WHERE is_deleted IS FALSE) AS count,
      json_agg(subquery) AS messages
    FROM (
      SELECT
        m.id,
        m.message,
        m.date_created,
        u.username = $1 AS your_message,
        json_build_object(
          'name', u.name,
          'username', u.username
        ) AS sender,
        CASE
          WHEN am.id IS NOT NULL THEN json_build_object(
            'stored_name', am.stored_name,
            'original_name', am.original_name,
            'mime_type', am.mime_type,
            'file_path', am.file_path
          )
          ELSE NULL
        END AS attachment
      FROM
        messages m
      LEFT JOIN
        users u ON u.id = m.sender_id
      LEFT JOIN
        attachments am ON am.message_id = m.id
      WHERE
        m.is_deleted IS FALSE
      ORDER BY
        m.id DESC
      LIMIT $2
    ) AS subquery
  `,
  [
    request.session.user.username,
    limit,
  ],

  (error, results) => {
    if (error || results.rows.length === 0) {
      return result.status(500).send({
        success: false,
        message: 'Failed to retrieve messages. Try again later',
      });
    }

    const count = parseInt(results.rows[0].count);
    const messages = results.rows[0].messages || [];

    messages.forEach(message => {
      switch (message.attachment)
      {
        case null:
          message.attachment = null;
          break;

        default:
          message.attachment = {
            stored_name: message.attachment.stored_name,
            original_name: message.attachment.original_name,
          }
          break;
      }
    });

    return result.status(200).send({
      success: true,
      data: {
        messages: messages.sort((a, b) => a.id - b.id),
        count: count,
      }
    });
  });
});

api.post('/api/send-message', middleware, (request, result) => {
  const message = request.body.message || null;

  if (message) {
    const dateStamp = new Date().toISOString();
    database.query(`
      INSERT INTO messages 
      (sender_id, message, date_created)
      VALUES
      ($1, $2, $3)
    `,
    [
      request.session.user.id,
      message,
      dateStamp,
    ]);

    listener.create_message({
      sender: {
        username: request.session.user.username,
        name: request.session.user.name,
      },
      date_created: dateStamp,
      message,
    });
  }

  return result.status(200).send({
    success: message !== null,
    message: (!message) ? 'Failed Receiving Message. Refresh your browser' : 'Message Received',
  });
});

api.post('/api/upload', middleware, (request, result) => {
  let attachedFile = {};

  const form = new formidable.IncomingForm({
    maxFileSize: maxUploadSize,
  });

  form.on('file', (field, file) => {
    attachedFile = file;
  });

  form.on('end', async () => {
    const fileName = crypto.randomUUID() + path.extname(attachedFile.originalFilename).toLowerCase();
    const filePath = path.join(__dirname, 'attachments', fileName);

    if (!fs.existsSync(path.join(__dirname, 'attachments'))) {
      fs.mkdirSync(path.join(__dirname, 'attachments'), { recursive: true });
    }

    fs.rename(attachedFile.filepath, filePath, (error) => {
      if (error) {
        return result.status(500).send({
          success: false,
          message: 'Failed to save file',
        });
      }

      database.query(`
        WITH inserted_message AS (
          INSERT INTO messages (sender_id, message, date_created)
          VALUES ($1, $2, $3)
          RETURNING id
        )
        INSERT INTO attachments (message_id, original_name, stored_name, file_path, mime_type, file_size)
        VALUES (
          (SELECT id FROM inserted_message), $4, $5, $6, $7, $8
        )`,
        [
          request.session.user.id,
          null,
          new Date().toISOString(),
          attachedFile.originalFilename,
          fileName,
          `/attachments/${fileName}`,
          attachedFile.mimetype,
          attachedFile.size,
        ],
        (error, results) => {
          if (error) {
            fs.unlink(filePath, () => {});

            return result.status(500).send({
              success: false,
              message: 'Failed to save attachment',
            });
          }

          listener.create_message({
            sender: {
              username: request.session.user.username,
              name: request.session.user.name,
            },
            date_created: new Date().toISOString(),
            attachment: {
              stored_name: fileName,
              original_name: attachedFile.originalFilename,
            },
          });

          result.status(200).send({
            success: true,
            message: 'File uploaded successfully',
          });
        }
      );
    });
  });

  form.parse(request, (error) => {
    if (error) {
      if (error.code == 1009) {
        return result.status(413).send({
          success: false,
          message: `File size exceeds the limit of ${maxUploadSize / 1024 / 1024} MB`,
        });
      }

      return result.status(500).send({
        success: false,
        message: 'Failed to parse form data',
      });
    }
  });
});

api.get('/api/attachment', (request, result) => {
  const attachment = request.query.attachment || null;
  if (attachment) {

    const filePath = path.resolve(__dirname, 'attachments', attachment);
    if (fs.existsSync(filePath)) {

      result.sendFile(filePath, (error) => {
        if (error) {
          return result.status(500).send({
            success: false,
            message: 'Failed to send attachment',
          });
        }
      });
    }
  }
});

api.listen(process.env.API_PORT);