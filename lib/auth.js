var getPermissions = function(headers) {
  var permissions = headers['x-sandstorm-permissions'];
  if (!permissions) {
    return [];
  }
  return permissions.split(',').map(function(p) {
    return p.trim();
  });
};

var hasPermission = function(headers, permission) {
  var permissions = getPermissions(headers);
  return permissions.indexOf(permission) !== -1;
};

exports.hasViewDataPermission = function(headers) {
  return hasPermission(headers, 'view-data');
};

exports.hasTrackerPermission = function(headers) {
  return hasPermission(headers, 'tracker');
};
