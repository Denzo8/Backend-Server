var express = require('express');

var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();

var Medico = require('../model/medico');
//===================================
//OBTENER TODOS LOS MEDICOS
//===================================
app.get('/', (req, response, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            });

});

//===================================
//CREAR NUEVO Medico
//===================================

app.post('/', mdAutenticacion.verificaToken, (req, response) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: req.medico
        });

    });

});

//===================================
//ACTUALIZAR MEDICO
//===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {

            return response.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + 'no existe',
                errors: { message: 'no existe un medico con ese id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }


            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });


});
//===================================
//BORRAR USUARIOS POR ID
//===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {

            return response.status(400).json({
                ok: false,
                mensaje: 'no existe medico con este id',
                errors: { message: 'no existe un medico con ese id' }
            });
        }
        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    })

});

module.exports = app;