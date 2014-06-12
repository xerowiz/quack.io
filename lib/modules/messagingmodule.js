var consts = require('./modules/consts.js'),
    users = require('./modules/users.js'),
    _ = require('underscore');

module.exports = function(io) {
    'use strict';
    return {

        post: function(req, resp) {
            var message = req.body.message;
            var user = req.body.user; 

            if (_.isUndefined(message) || _.isEmpty(message.trim())) {
                return resp.json(400, {error: 'Message invalid'}); 
            }

            if (!users.isAuthorized(user)) {
                return resp.json(400, {error: 'Unauthorized user'}); 
            }

            io.sockets.emit(consts.CLI_MESS_RECEIVED,
                            {user: user, message: message});
        }

    };
};
