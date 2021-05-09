module.exports = function(app, swig, gestorBD) {

    app.get('/comentario/borrar/:id', function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            if (comentarios == null) {
                res.send("Error al recuperar el comentario.");
            } else {
                if (comentarios[0].autor !== req.session.usuario) {
                    res.send("No puedes borrar este comentario porque no es tuyo");
                }
                else {
                    gestorBD.borrarComentario(criterio, function (error) {
                        if (error == null) {
                            res.send("Error al borrar el comentario");
                        }
                        else {
                            res.send("Comentario borrado");
                        }
                    });
                }
            }
        });
    });

    app.post('/comentarios/:oferta_id', function (req, res) {
        if ( req.session.rol === 2){
            res.send("Debes iniciar sesión antes de comentar");
            return;
        }

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.oferta_id)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas[0] == null) {
                res.send("Error al encontrar la oferta");
            } else {
                let mensaje = {
                    propietario: ofertas[0].autor,
                    interesado: req.session.usuario,
                    oferta: req.params.oferta_id,
                    mensaje: req.body.texto,
                    leido: false
                }

                gestorBD.insertarComentario(mensaje, function (id) {
                    if (id == null) {
                        res.send("Error al insertar comentario");
                    } else {
                        res.redirect("/oferta/"+req.params.oferta_id);
                    }
                })
            }
        });
    });

};