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
    if (req.query.clang == 'en') {
      res.send("Oops!, You must be logged in to view this page. please join this site first!.");
    } else {
      res.send("헉. 죄송합니다. 우선 회원가입부터 하시면 됩니다.");
    }
    res.send("You must be logged in to view this page.");
    //var err = new Error('You must be logged in to view this page.');
    //err.status = 401;
    //return res.redirect('/');
  }
}
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
