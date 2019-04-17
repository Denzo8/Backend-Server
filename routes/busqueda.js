var express = require('express');

var app = express();

var Hospital = require('../model/hospital');
var Medico = require('../model/medico');
var Usuario = require('../model/usuario');



//===================================
//BUSQUEDA POR COLECCION
//===================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busqueda solo son: usuarios, hospitales, medicos',
                error: { message: 'Tipo de tabla coleccion no valido' }

            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});

//===================================
//BUSQUEDA GENERAL
//===================================
app.get('/todo/:busqueda', (req, response, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all(
        [buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ]
    ).then(respuesta => {
        response.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    })



});


function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')

        .exec((err, hospitales) => {
            if (err) {
                reject('error al cargar hospitales', err);
            } else {
                resolve(hospitales)
            }
        });
    });


}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(medicos)
                }
            });
    });


}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar hospitales', err);
                } else {
                    resolve(usuarios)
                }
            });
    });


}

module.exports = app;