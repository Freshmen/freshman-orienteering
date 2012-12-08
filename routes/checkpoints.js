exports.show = function(req, res){
  res.render('show', {});
};

exports.list = function(req, res){
  res.render('list', {});
};

exports.edit = function(req, res){
  res.render('edit', {});
};

exports.create = function(req, res){
  res.render('create', {});
};