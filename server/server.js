const { database } = require('./database');

const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const api = express();

api.use(express.json());
api.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'token',
  cookie: {
    maxAge: 3600000,
  },
}));

api.use(function(request, result, next) {
  result.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  result.setHeader('Access-Control-Allow-Methods', 'POST');
  result.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  result.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

api.post('/api/session', function(request, result) {
  switch (request.session.user) {
    case undefined:
      return result.json({
        success: false,
        message: 'Session not found',
      });

    default:
      return result.json({
        success: true,
        session: {
          username: request.session.user.username,
          name: request.session.user.name,
          date_created: request.session.user.date_created,
        },
      });
  }
});

api.post('/api/login', function(request, result) {
  if (!request.body.username || !request.body.password) {
    return result.json({
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
      id,
      username,
      name,
      date_created
    FROM
      users
    WHERE
      username = $1 AND
      password = $2
  `,
    [
      request.body.username,
      decrypted,
    ],

  (error, results) => {
    if (error) {
      return result.json({
        success: false,
        message: 'Login Failed. Contact an Administrator',
      });
    }

    if (results.rows.length > 0) {
      request.session.user = {
        id: results.rows[0].id,
        name: results.rows[0].name,
        username: request.body.username,
        date_created: results.rows[0].date_created,
      
      }; request.session.save();

      return result.json({
        success: true,
        message: 'Authenticating...',
        session: {
          username: request.body.username,
          name: results.rows[0].name,
          date_created: results.rows[0].date_created,
        },
      });
    
    } else {
      return result.json({
        success: false,
        token: null,
        message: 'Login failed, try again',
      });
    }
  });
});

api.post('/api/messages', function(request, result) {
  database.query(`
    SELECT
      m.id,
      m.message,
      m.date_created,
      json_build_object(
            'id', u.id,
            'name', u.name,
            'username', u.username
        ) AS sender
    FROM
      messages m
    LEFT JOIN
      users u ON u.id = m.sender_id
    WHERE
      m.is_deleted IS FALSE
    LIMIT 10
  `,

  (error, results) => {
    if (error) {
      return result.json({
        success: false,
        message: 'Failed to retrieve messages. Try again later',
      });
    }

    return result.json({
      success: true,
      messages: results.rows,
    });
  });
});

api.listen(process.env.API_PORT);