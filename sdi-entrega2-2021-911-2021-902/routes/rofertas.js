module.exports = function (app, swig, gestorBD) {

    /*
        Método que te redirige a la vista para agregar ofertas
    */
    app.get('/ofertas/agregar', function (req, res) {
        res.send(app.get('returnVista')(req, 'bagregar.html', null));
    })

    /*
        Método que elimina la oferta que tenga como id la que le pases por parámetro y te redirige a /publicaciones
    */
    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                res.redirect("/error" +
                    "?mensaje=No existe la oferta" +
                    "&tipoMensaje=alert-danger ");
            } else {
                app.get('logger').debug("Eliminada oferta con id: " + req.params.id);
                res.redirect("/publicaciones");
            }
        });
    })

    /*
        Método que te asigna como comprada la oferta que le pasas como pàrámetro (si la puedes comprar), y te redirige a /compras
    */
    app.get('/oferta/comprar/:id', function (req, res) {
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            ofertaId: ofertaId
        }

        let usuarioOferta = {"ofertaId": gestorBD.mongo.ObjectID(req.params.id)};

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
                            let saldoNuevo = req.session.saldo - ofertas[0].precio

                            if (saldoNuevo >= 0) {
                                gestorBD.insertarCompra(compra, function (idCompra) {
                                    if (idCompra == null) {
                                        res.send("Ha ocurrido un fallo al comprar la oferta");
                                    } else {
                                        let usuario = {
                                            saldo: saldoNuevo
                                        }
                                        let criterio = {email: req.session.usuario};

                                        gestorBD.modificarUsuario(criterio, usuario, function (result) {
                                            if (result == null) {
                                                res.send("Error al comprar ");
                                            } else {
                                                app.get('logger').debug("Oferta con id: " + req.params.id + " comprada por " + req.session.usuario);
                                                req.session.saldo = saldoNuevo;
                                                res.redirect("/compras");
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                res.redirect("/error" +
                                    "?mensaje=Saldo insuficiente" +
                                    "&tipoMensaje=alert-danger ");
                            }
                        } else {
                            res.send("La oferta ya ha sido comprada");
                        }
                    }
                }
            })
        })
    });

    /*
        Método que te redirige a la página de compras propias
    */
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

    /*
        Método que te redirige a la página de modificar oferta
    */
    app.get('/oferta/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send(respuesta);
            } else {
                res.send(app.get('returnVista')(req, 'bofertaModificar.html', {oferta: ofertas[0]}));
            }
        });
    });

    /*
        Método que destaca la oferta que le pasas por parámetro y baja el dinero del usuario
    */
    app.get('/oferta/destacar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};

        let oferta = {
            destacada: true
        }

        gestorBD.modificarOferta(criterio, oferta, function (result) {
            if (result == null) {
                res.send("Error al destacar oferta");
            } else {
                let saldoNuevo = req.session.saldo - 20;

                if (saldoNuevo >= 0) {
                    let usuario = {
                        saldo: saldoNuevo
                    }
                    let criterio = {email: req.session.usuario};

                    gestorBD.modificarUsuario(criterio, usuario, function (result) {
                        if (result == null) {
                            res.send("Error al destacar oferta");
                        } else {
                            app.get('logger').debug("Oferta con id: " + req.params.id + ", destacada");
                            req.session.saldo = saldoNuevo;
                            res.redirect("/publicaciones?mensaje=Oferta destacada")
                        }
                    });
                    ;
                } else {
                    res.send("Saldo insuficiente para destacar la oferta");
                }
            }
        });

    });

    /*
        Método que te redirige a la página principal de la tienda
    */
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
                    ofertas: ofertas,
                    paginas: paginas,
                    actual: pg
                }));
            }
        });
    });

    /*
        Método que te redirige a la página de tus publicaciones
    */
    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};
        let criterioDestacadas = {destacada: true};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send("Error al listar");
            } else {
                gestorBD.obtenerOfertas(criterioDestacadas, function (ofertasDestacadas) {
                    if (ofertasDestacadas == null) {
                        res.send("Error al listar destacadas");
                    } else {

                        res.send(app.get('returnVista')(req, 'bpublicaciones.html', {
                            ofertas: ofertas,
                            ofertasDestacadas: ofertasDestacadas
                        }));
                    }
                });
            }
        });
    });

    /*
        Método que redirige a la página de una oferta para poder comprarla o verla en detalle
    */
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
                            res.redirect("/tienda?mensaje=Esta oferta es tuya");

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

    /*
        Método que crea una nueva oferta y la mete en la base de datos, si es destacada, también baja 20€ al usuario
    */
    app.post("/oferta", function (req, res) {

        let datetime = new Date();
        let destacada = false;

        console.log(req.body.destacada);

        if (req.body.destacada != null) {
            destacada = true;
        }

        let oferta = {
            titulo: req.body.titulo,
            precio: req.body.precio,
            detalles: req.body.detalles,
            fecha: datetime.toISOString().slice(0, 10),
            autor: req.session.usuario,
            destacada: destacada
        }

        console.log(destacada)
        let isValid = false;

        if (destacada) {
            let saldoNuevo = req.session.saldo - 20;
            console.log(saldoNuevo);

            if (saldoNuevo >= 0) {
                isValid = true;

                let usuario = {
                    saldo: saldoNuevo
                }
                let criterio = {email: req.session.usuario};

                req.session.saldo = saldoNuevo;

                gestorBD.modificarUsuario(criterio, usuario, function (result) {
                    if (result == null) {
                        req.session.saldo = req.session.saldo + 20;
                        res.send("Error al crear oferta");
                    }
                });
            } else {
                res.redirect("/publicaciones?mensaje=No tienes suficiente dinero para crear la oferta como destacada");
            }
        }

        if (destacada && isValid || !destacada) {
            gestorBD.insertarOferta(oferta, function (id) {
                if (id == null) {
                    res.send("Error al insertar oferta");
                } else {
                    app.get('logger').debug("Oferta con título: " + req.body.titulo + ", creada");
                    res.redirect("/publicaciones?mensaje=Oferta insertada");
                }
            });
        }
    });

    /*
        Método que modifica una oferta y la mete en la base de datos
    */
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
                app.get('logger').debug("Oferta con id: " + req.params.id + ", modificada");
                res.redirect("/publicaciones?mensaje=Oferta modificada");
            }
        });
    });

};
