function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/catalog/');
  }
  return next();
}
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.send("You must be logged in to view this page.");
    //var err = new Error('You must be logged in to view this page.');
    //err.status = 401;
    //return res.redirect('/');
  }
}
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
