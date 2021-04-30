module.exports = function (app, gestorBD) {

    app.get("/api/oferta", function (req, res) {
        gestorBD.obtenerOfertas({}, function (ofertas) {
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

    app.delete("/api/oferta/:id", function (req, res) {

        let usuario = res.usuario;

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        let criterioCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterioCancion, function (oferta) {
            if (oferta == null || oferta[0].autor !== usuario) {
                res.status(403);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                gestorBD.eliminarOferta(criterio, function (pfertas) {
                    if (pfertas == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error al eliminar la canción"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(pfertas));
                    }
                });
            }
        });
    });

    app.put("/api/oferta/:id", function (req, res) {

        let usuario = res.usuario;

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        let oferta = {}; // Solo los atributos a modificar

        if (req.body.nombre != null) {
            if (req.body.nombre.length >= 3)
                oferta.nombre = req.body.nombre;
            else {
                res.status(403);
                res.json({
                    error: "el nombre debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.genero != null) {
            if (req.body.genero.length >= 3) {
                oferta.genero = req.body.genero;
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
                    error: "el precio de la canción debe ser mayor que 0"
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

        if (req.body.nombre != null) {
            if (req.body.nombre.length >= 3)
                oferta.nombre = req.body.nombre;
            else {
                res.status(403);
                res.json({
                    error: "el nombre debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.genero != null) {
            if (req.body.genero.length >= 3) {
                oferta.genero = req.body.genero;
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
                    error: "el precio de la canción debe ser mayor que 0"
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
                    mensaje: "canción insertada",
                    _id: id
                })
            }
        });
    });

    app.post("/api/autenticar/", function (req, res) {
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