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

    app.post('/comentarios/:cancion_id', function (req, res) {
        if ( req.session.usuario == null){
            res.send("Debes iniciar sesión antes de comentar");
            return;
        }

        let comentario = {
            texto : req.body.texto,
            autor: req.session.usuario,
            cancion_id: req.params.cancion_id
        }
        gestorBD.insertarComentario(comentario, function (id) {
            if (id == null) {
                res.send("Error al insertar comentario");
            } else {
                res.send("Comentario insertado");
            }
        })
    });

};