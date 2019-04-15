var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//===================================
//VERIFICAR TOKEN  (MIDDLEWARE)
//===================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        requ.usuario = decoded.usuario;
        next();
    });

}