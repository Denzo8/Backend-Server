var express = require('express');

var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();

var Usuario = require('../model/usuario');
//===================================
//OBTENER TODOS LOS USUARIOS
//===================================
app.get('/', (require, response, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                response.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });

});

//===================================
//CREAR NUEVO USUARIOS
//===================================

app.post('/', mdAutenticacion.verificaToken, (req, response) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

//===================================
//ACTUALIZAR USUARIOS
//===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {

            return response.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + 'no existe',
                errors: { message: 'no existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;


        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            if (!usuarioBorrado) {

                return response.status(400).json({
                    ok: false,
                    mensaje: 'no existe usuario con este id',
                    errors: { message: 'no existe un usuario con ese id' }
                });
            }

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });


});
//===================================
//BORRAR USUARIOS POR ID
//===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

});

module.exports = app;