const { adminRoutes, userRoutes } = require('./allowed-routes');

const middleware = (request, result, next) => {
  const requestType = request.session?.user?.role?.toLowerCase();

  if (requestType == 'admin' && adminRoutes.some((route) => request.url.includes(route))) {
    return next();
  }

  if (requestType == 'user' && userRoutes.some((route) => request.url.includes(route))) {
    return next();
  }
  
  return result.json({
    success: false,
    message: 'Invalid Request',
  });
};

module.exports = { middleware };