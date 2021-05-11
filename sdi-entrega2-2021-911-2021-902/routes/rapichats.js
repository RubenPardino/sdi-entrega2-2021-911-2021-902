module.exports = function (app, gestorBD) {
    /*
       Método que devuelve la conversación que tuviste con el propietario de una oferta que pasas por parámetro si eres el interesado,
       si eres el propietario de la oferta, deberás elegir la persona con la que tuviste la conversación y pasarla por la URL
   */
    app.get("/api/conversacion/:id", function (req, res) {
        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterioOferta, function (ofertas) {
            if (ofertas[0] == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al buscar la oferta"
                })
            } else {
                if (res.usuario === ofertas[0].autor) {
                    if (req.query.usuario == null) {
                        res.status(500);
                        res.json({
                            error: "al ser el propietario de la oferta, debes indicar el usuario de la conversación que quieres sacar"
                        })
                    } else {
                        let criterio = {
                            "oferta": ofertas[0]._id.toString(),
                            $or: [{
                                "emisor": ofertas[0].autor,
                                "receptor": req.query.usuario
                            }, {"emisor": req.query.usuario, "receptor": ofertas[0].autor}]
                        }

                        gestorBD.obtenerComentarios(criterio, function (comentarios) {
                            if (comentarios[0] == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error al recuperar los comentarios"
                                })
                            } else {
                                res.status(200);
                                res.send(JSON.stringify(comentarios));
                            }
                        })
                    }

                } else {
                    let criterio = {
                        "oferta": ofertas[0]._id.toString(),
                        $or: [{"emisor": ofertas[0].autor, "receptor": res.usuario}, {
                            "emisor": res.usuario,
                            "receptor": ofertas[0].autor
                        }]
                    }

                    gestorBD.obtenerComentarios(criterio, function (comentarios) {
                        if (comentarios == null) {

                            res.status(500);
                            res.json({
                                error: "se ha producido un error al recuperar los comentarios"
                            })
                        } else {
                            res.status(200);
                            res.send(JSON.stringify(comentarios));
                        }
                    })
                }
            }
        })
    });

    /*
        Método que devuelve todas las conversaciones de un usuario identificado
    */
    app.get("/api/conversaciones", function (req, res) {
        let criterio = {$or: [{"emisor": res.usuario}, {"receptor": res.usuario}]}

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            if (comentarios[0] == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al recuperar los comentarios"
                })
            } else {
                let comentariosPropietario = [];
                let comentariosInteresado = [];

                let i = 1;

                for (let comentario of comentarios) {
                    let criterioOferta = {"_id": gestorBD.mongo.ObjectID(comentario.oferta)}

                    gestorBD.obtenerOfertas(criterioOferta, function (oferta) {
                        if (oferta == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error al comprobar las ofertas de los comentarios"
                            })
                        } else {
                            i++;
                            if (oferta[0].autor === res.usuario) {
                                comentariosPropietario.push(comentario);
                            } else {
                                comentariosInteresado.push(comentario);
                            }

                            if (i === comentarios.length) {
                                res.status(200);
                                res.send({
                                    propietario: JSON.stringify(comentariosPropietario),
                                    interesado: comentariosInteresado
                                });
                            }
                        }
                    })
                }
            }
        })
    })

    /*
        Método que devuelve las conversaciones iniciadas
    */
    app.get("/api/conversaciones/iniciadas", function (req, res) {
        let criterio = {$or: [{"emisor": res.usuario}, {"receptor": res.usuario}]}

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            if (comentarios[0] == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al recuperar los comentarios"
                })
            } else {
                let comentariosPropietario = [];
                let comentariosInteresado = [];
                let offers = [];
                let idscomentariosFiltrados = [];

                let i = 1;

                for (let comentario of comentarios) {

                    let criterioOferta = {"_id": gestorBD.mongo.ObjectID(comentario.oferta)}

                    gestorBD.obtenerOfertas(criterioOferta, function (oferta) {
                        if (oferta == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error al comprobar las ofertas de los comentarios"
                            })
                        } else {
                            i++;
                            if (!idscomentariosFiltrados.includes(comentario.oferta)) {
                                idscomentariosFiltrados.push(comentario.oferta)

                                offers.push(oferta);
                                if (oferta[0].autor === res.usuario) {
                                    comentariosPropietario.push(comentario);
                                } else {
                                    comentariosInteresado.push(comentario);
                                }

                                if (i === comentarios.length) {
                                    res.status(200);
                                    res.send({
                                        propietario: JSON.stringify(comentariosPropietario),
                                        interesado: comentariosInteresado,
                                        oferta: offers
                                    });
                                }
                            }
                        }
                    })
                }
            }
        })
    })


    /*
        Método POST al que se le manda por el cuerpo la oferta a la que quieres enviar un mensaje, el mensaje
        que quieres enviar, y en caso de ser el propietario de la oferta, el receptor al que le llegará el mensaje.
    */
    app.post("/api/mensaje/", function (req, res) {
        if (req.body.oferta == null || req.body.mensaje == null) {
            res.status(500);
            res.json({
                error: "debes indicar la oferta y el mensaje que quieres enviar"
            })
        }

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.body.oferta)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas[0] == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al buscar la oferta"
                })
            } else {
                if (res.usuario === ofertas[0].autor) {
                    if (req.body.receptor == null) {
                        res.status(500);
                        res.json({
                            error: "debes indicar el receptor al que quieres enviar el mensaje"
                        })
                    } else {
                        let criterioOferta = {"emisor": req.body.receptor, "oferta": req.body.oferta}

                        gestorBD.obtenerComentarios(criterioOferta, function (comentarios) {
                            if (comentarios[0] == null) {
                                res.status(500);
                                res.json({
                                    error: "el interesado debe de ser quien inicie la conversación"
                                })
                            } else {
                                let mensaje = {
                                    receptor: req.body.receptor,
                                    emisor: res.usuario,
                                    oferta: req.body.oferta,
                                    fecha: Date.now(),
                                    mensaje: req.body.mensaje,
                                    leido: false
                                }

                                gestorBD.insertarComentario(mensaje, function (id) {
                                    if (id == null) {
                                        res.status(500);
                                        res.json({
                                            error: "se ha producido un error al enviar el mensaje"
                                        })
                                    } else {
                                        res.status(201);
                                        res.json({
                                            mensaje: "mensaje enviado",
                                            _id: id
                                        })
                                    }
                                })
                            }
                        });
                    }
                } else {
                    let mensaje = {
                        receptor: ofertas[0].autor,
                        emisor: res.usuario,
                        oferta: req.body.oferta,
                        fecha: Date.now(),
                        mensaje: req.body.mensaje,
                        leido: false
                    }

                    gestorBD.insertarComentario(mensaje, function (id) {
                        if (id == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error al enviar el mensaje"
                            })
                        } else {
                            res.status(201);
                            res.json({
                                mensaje: "mensaje enviado",
                                _id: id
                            })
                        }
                    })
                }
            }
        });

    });

    /*
        Método que borra el char que le pasas como parámetro
    */
    app.post("/api/chat/:id", function (req, res) {

        let criterio = { "_id":  gestorBD.mongo.ObjectID(req.params.id) }

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            if (comentarios == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al recuperar los comentario"
                })
            } else {
                let criterioBorrado = { "oferta": comentarios[0].oferta, $or: [ { "emisor": comentarios[0].emisor, "receptor": comentarios[0].receptor }, { "emisor": comentarios[0].receptor, "receptor": comentarios[0].emisor }] }

                gestorBD.borrarComentario(criterioBorrado, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error al borrar la conversación"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje: "conversación eliminada"
                        })
                    }
                })
            }
        })
    })

    /*
        Método que pone en leído un mensaje que le pasas por el cuerpo
    */
    app.post("/api/mensaje/leer", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.body.mensaje)}

        gestorBD.obtenerComentarios(criterio, function (comentarios) {
            if (comentarios[0] == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al recuperar el comentario"
                })
            } else {
                if (res.usuario === comentarios[0].receptor || res.usuario === comentarios[0].emisor) {
                    comentarios[0].leido = true;

                    gestorBD.modificarMensaje(criterio, comentarios[0], function (result) {
                        if (result == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error al marcar el mensaje como leído"
                            })
                        } else {
                            res.status(200);
                            res.json({
                                mensaje: "mensaje marcado como leído",
                                _id: req.params.id
                            })
                        }
                    })
                } else {
                    res.status(500);
                    res.json({
                        error: "no puedes modificar un mensaje que no es tuyo"
                    })
                }
            }
        })

    })
}