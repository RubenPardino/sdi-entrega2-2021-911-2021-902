module.exports = function (app, swig, gestorBD) {

    app.get('/ofertas/agregar', function (req, res) {
        res.send(app.get('returnVista')(req, 'bagregar.html', null));
    })

    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                res.redirect("/error" +
                    "?mensaje=No existe la oferta" +
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/oferta/comprar/:id', function (req, res) {
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            ofertaId: ofertaId
        }

        let usuarioOferta = {"usuario": req.session.usuario, "ofertaId": gestorBD.mongo.ObjectID(req.params.id)};

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            gestorBD.obtenerCompras(usuarioOferta, function (compras) {
                if (ofertas == null) {
                    res.send("Error al recuperar la oferta.");
                } else {
                    if (req.session.usuario === ofertas[0].autor) {
                        res.send("La oferta es suya");
                    } else {
                        if (compras.length === 0) {
                            gestorBD.insertarCompra(compra, function (idCompra) {
                                if (idCompra == null) {
                                    res.send(respuesta);
                                } else {
                                    let saldoNuevo = req.session.saldo - ofertas[0].precio

                                    if (saldoNuevo > 0) {
                                        let usuario = {
                                            saldo: saldoNuevo
                                        }
                                        let criterio = {email: req.session.usuario};

                                        gestorBD.modificarUsuario(criterio, usuario, function (result) {
                                            if (result == null) {
                                                res.send("Error al comprar ");
                                            } else {
                                                req.session.saldo = saldoNuevo;
                                                res.redirect("/compras");
                                            }
                                        });
                                    } else
                                        res.redirect("/error" +
                                            "?mensaje=Saldo insuficiente" +
                                            "&tipoMensaje=alert-danger ");
                                }
                            });
                        } else {
                            res.send("Ya has comprado la oferta");
                        }
                    }
                }
            })
        })
    });

    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};

        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar");
            } else {
                let ofertasCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    ofertasCompradasIds.push(compras[i].ofertaId);
                }

                let criterio = {"_id": {$in: ofertasCompradasIds}};
                gestorBD.obtenerOfertas(criterio, function (ofertas) {
                    res.send(app.get('returnVista')(req, 'bcompras.html', ofertas));
                })
            }
        })
    });


    app.get('/oferta/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send(respuesta);
            } else {
                res.send(app.get('returnVista')(req, 'bofertaModificar.html', ofertas[0]));
            }
        });
    });

    app.get('/ofertas/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"titulo": {$regex: ".*" + req.query.busqueda.toLowerCase() + ".*"}};
        }

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerOfertasPg(criterio, pg, function (ofertas, total) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                res.send(app.get('returnVista')(req, 'btienda.html', {
                    ofertas: ofertas.filter(n => n.autor !== req.session.usuario),
                    paginas: paginas,
                    actual: pg
                }));
            }
        });
    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                res.send(app.get('returnVista')(req, 'bpublicaciones.html', ofertas));
            }
        });
    });

    app.get('/oferta/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioComentarios = {"oferta_id": req.params.id};
        let usuarioOferta = {"usuario": req.session.usuario, "ofertaId": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            gestorBD.obtenerComentarios(criterioComentarios, function (comentarios) {
                gestorBD.obtenerCompras(usuarioOferta, function (compras) {
                    if (ofertas == null) {
                        res.send("Error al recuperar la oferta.");
                    } else {
                        if (req.session.usuario === ofertas[0].autor) {
                            res.send("No puedes comprar tu propia oferta ");

                        } else {
                            res.send(app.get('returnVista')(req, 'boferta.html', {
                                oferta: ofertas[0],
                                comentarios: comentarios,
                                comprado: compras.length != 0
                            }))
                        }

                    }
                })
            });
        });
    });

    app.post("/oferta", function (req, res) {

        var datetime = new Date();

        let oferta = {
            titulo: req.body.titulo,
            precio: req.body.precio,
            detalles: req.body.detalles,
            fecha: datetime.toISOString().slice(0, 10),
            autor: req.session.usuario
        }
        // Conectarse
        gestorBD.insertarOferta(oferta, function (id) {
            if (id == null) {
                res.send("Error al insertar oferta");
            } else {
                res.redirect("/publicaciones?mensaje=Oferta insertada");
            }
        });
    });

    app.post('/oferta/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};

        let oferta = {
            titulo: req.body.titulo,
            detalles: req.body.detalles,
            precio: req.body.precio
        }

        gestorBD.modificarOferta(criterio, oferta, function (result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                res.redirect("/publicaciones?mensaje=Oferta modificada");
            }
        });
    })

};
