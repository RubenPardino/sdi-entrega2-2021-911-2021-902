module.exports = function (app, swig, gestorBD) {

    app.get('/ofertas/agregar', function (req, res) {

        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })

    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/oferta/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        }

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let usuarioOferta = {"usuario": req.session.usuario, "cancionId": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            gestorBD.obtenerCompras(usuarioOferta, function (compras) {
                if (ofertas == null) {
                    res.send("Error al recuperar la canción.");
                } else {
                    if (req.session.usuario == ofertas[0].autor) {
                        res.send("La canción es suya");
                    } else {
                        if (compras.length == 0) {
                            gestorBD.insertarCompra(compra, function (idCompra) {
                                if (idCompra == null) {
                                    res.send(respuesta);
                                } else {
                                    res.redirect("/compras");
                                }
                            });
                        } else {
                            res.send("Ya has comprado la canción");
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
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }

                let criterio = {"_id": {$in: cancionesCompradasIds}};
                gestorBD.obtenerOfertas(criterio, function (ofertas) {
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones: ofertas
                        });
                    res.send(respuesta);
                })
            }
        })
    });

    app.get("/canciones", function (req, res) {

        let canciones = [{
            "nombre": "Blank space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];

        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });

        res.send(respuesta);
    });

    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);

        res.send(String(respuesta));
    });

    app.get('/oferta/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: ofertas[0]
                    });
                res.send(respuesta);
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
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
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
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: ofertas,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        canciones: ofertas
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/oferta/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioComentarios = {"cancion_id": req.params.id};
        let usuarioOferta = {"usuario": req.session.usuario, "cancionId": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            gestorBD.obtenerComentarios(criterioComentarios, function (comentarios) {
                gestorBD.obtenerCompras(usuarioOferta, function (compras) {
                    if (ofertas == null) {
                        res.send("Error al recuperar la canción.");
                    } else {
                        if (req.session.usuario == ofertas[0].autor) {
                            let configuracion = {
                                url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                                method: "get",
                                headers: {
                                    "token": "ejemplo",
                                }
                            }
                            let rest = app.get("rest");
                            rest(configuracion, function (error, response, body) {
                                console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                                let objetoRespuesta = JSON.parse(body);
                                let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                                // nuevo campo "usd"
                                ofertas[0].usd = cambioUSD * ofertas[0].precio;
                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: ofertas[0],
                                        comentarios: comentarios,
                                        audio: true
                                    });
                                res.send(respuesta);
                            })
                        } else {
                            if (compras.length == 0) {
                                let configuracion = {
                                    url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                                    method: "get",
                                    headers: {
                                        "token": "ejemplo",
                                    }
                                }
                                let rest = app.get("rest");
                                rest(configuracion, function (error, response, body) {
                                    console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                                    let objetoRespuesta = JSON.parse(body);
                                    let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                                    // nuevo campo "usd"
                                    ofertas[0].usd = cambioUSD * ofertas[0].precio;
                                    let respuesta = swig.renderFile('views/bcancion.html',
                                        {
                                            cancion: ofertas[0],
                                            comentarios: comentarios,
                                            audio: false
                                        });
                                    res.send(respuesta);
                                })
                            } else {
                                let configuracion = {
                                    url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                                    method: "get",
                                    headers: {
                                        "token": "ejemplo",
                                    }
                                }
                                let rest = app.get("rest");
                                rest(configuracion, function (error, response, body) {
                                    console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                                    let objetoRespuesta = JSON.parse(body);
                                    let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                                    // nuevo campo "usd"
                                    ofertas[0].usd = cambioUSD * ofertas[0].precio;
                                    let respuesta = swig.renderFile('views/bcancion.html',
                                        {
                                            cancion: ofertas[0],
                                            comentarios: comentarios,
                                            audio: true
                                        });
                                    res.send(respuesta);
                                })

                            }
                        }

                    }
                })
            });
        });
    });

    app.post("/oferta", function (req, res) {

        let cancion = {
            nombre: req.body.nombre,
            precio: req.body.precio,
            detalles: req.body.detalles,
            fecha: Date.now()
        }
        // Conectarse
        gestorBD.insertarOferta(cancion, function (id) {
            if (id == null) {
                res.send("Error al insertar oferta");
            } else {
                res.redirect("/publicaciones?mensaje=Oferta insertada");
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let oferta = {
            nombre: req.body.nombre,
            genero: req.body.genero,
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
