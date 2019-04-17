var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();

var Hospital = require('../model/hospital');
//===================================
//OBTENER TODOS LOS HOSPITALES
//===================================
app.get('/', (req, response, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }
                Hospital.count({}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });
            });

});

//===================================
//CREAR NUEVO Hospital
//===================================

app.post('/', mdAutenticacion.verificaToken, (req, response) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

//===================================
//ACTUALIZAR HOSPITAL
//===================================
app.put('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {

            return response.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + 'no existe',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }


            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });


});
//===================================
//BORRAR USUARIOS POR ID
//===================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, response) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {

            return response.status(400).json({
                ok: false,
                mensaje: 'no existe hospital con este id',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }
        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    })

});

module.exports = app;