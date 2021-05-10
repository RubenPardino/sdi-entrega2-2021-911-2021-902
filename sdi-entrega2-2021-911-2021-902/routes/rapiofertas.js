module.exports = function (app, gestorBD) {

    app.get("/api/ofertas", function (req, res) {
        gestorBD.obtenerOfertas({}, function (ofertas) {
            ofertas = ofertas.filter(n => n.autor !== res.usuario)

            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });

    app.get("/api/oferta/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerOfertas(criterio, function (oferta) {
            if (oferta == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(oferta[0]));
            }
        });
    });

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
                        let criterio = { "oferta": ofertas[0]._id.toString(), $or: [ { "emisor": ofertas[0].autor, "receptor": req.query.usuario }, { "emisor": req.query.usuario, "receptor": ofertas[0].autor }] }

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
                    let criterio = { "oferta": ofertas[0]._id.toString(), $or: [ { "emisor": ofertas[0].autor, "receptor": res.usuario }, { "emisor": res.usuario, "receptor": ofertas[0].autor }] }

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
            }
        })
    });

    /*
        Método que devuelve todas las conversaciones de un usuario identificado
    */
    app.get("/api/conversaciones", function (req, res) {
        let criterio = { $or: [ { "emisor": res.usuario }, { "receptor": res.usuario } ] }

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
                    let criterioOferta = { "_id": gestorBD.mongo.ObjectID(comentario.oferta) }

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
                                    "Conversaciones como propietario": JSON.stringify(comentariosPropietario),
                                    "Conversaciones como interesado": JSON.stringify(comentariosInteresado)
                                });
                            }
                        }
                    })
                }
            }
        })
    })

    app.delete("/api/oferta/:id", function (req, res) {

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.eliminarOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error al eliminar la oferta"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });

    app.put("/api/oferta/:id", function (req, res) {

        let usuario = res.usuario;

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        let oferta = {}; // Solo los atributos a modificar

        if (req.body.titulo != null) {
            if (req.body.titulo.length >= 3)
                oferta.titulo = req.body.titulo;
            else {
                res.status(403);
                res.json({
                    error: "el título debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.detalles != null) {
            if (req.body.detalles.length >= 3) {
                oferta.detalles = req.body.detalles;
            } else {
                res.status(403);
                res.json({
                    error: "los detalles deben tener al menos 3 caracteres"
                })
            }

        }

        if (req.body.precio != null) {
            if (req.body.precio > 0) {
                oferta.precio = req.body.precio;
            } else {
                res.status(403);
                res.json({
                    error: "el precio de la oferta debe ser mayor que 0"
                })
            }
        }

        gestorBD.obtenerOfertas(criterioOferta, function (ofertas) {
            if (ofertas == null || ofertas[0].autor !== usuario) {
                res.status(403);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                gestorBD.modificarOferta(criterio, oferta, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error al modificar la oferta"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje: "oferta modificada",
                            _id: req.params.id
                        })
                    }
                });
            }
        });
    });

    app.post("/api/oferta", function (req, res) {

        let oferta = {};

        if (req.body.titulo != null) {
            if (req.body.titulo.length >= 3)
                oferta.titulo = req.body.titulo;
            else {
                res.status(403);
                res.json({
                    error: "el nombre debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.detalles != null) {
            if (req.body.detalles.length >= 3) {
                oferta.detalles = req.body.detalles;
            } else {
                res.status(403);
                res.json({
                    error: "el género debe tener al menos 3 caracteres"
                })
            }

        }

        if (req.body.precio != null) {
            if (req.body.precio > 0) {
                oferta.precio = req.body.precio;
            } else {
                res.status(403);
                res.json({
                    error: "el precio de la oferta debe ser mayor que 0"
                })
            }
        }

        gestorBD.insertarOferta(oferta, function (id) {
            if (id == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(201);
                res.json({
                    mensaje: "oferta insertada",
                    _id: id
                })
            }
        });
    });

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
                        let criterioOferta = { "emisor": req.body.receptor, "oferta": req.body.oferta }

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

    app.post("/api/autenticar", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex')

        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({
                    autenticado: false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                })
            }
        })

    });
}