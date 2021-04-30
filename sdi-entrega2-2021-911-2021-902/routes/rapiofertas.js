module.exports = function (app, gestorBD) {

    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerOfertas({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    app.get("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerOfertas(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });

    app.delete("/api/cancion/:id", function (req, res) {

        let usuario = res.usuario;

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        let criterioCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerOfertas(criterioCancion, function (cancion) {
            if (cancion == null || cancion[0].autor !== usuario) {
                res.status(403);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                gestorBD.eliminarOferta(criterio, function (canciones) {
                    if (canciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error al eliminar la canción"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(canciones));
                    }
                });
            }
        });
    });

    app.put("/api/cancion/:id", function (req, res) {

        let usuario = res.usuario;

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let criterioCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        let cancion = {}; // Solo los atributos a modificar

        if (req.body.nombre != null) {
            if (req.body.nombre.length >= 3)
                cancion.nombre = req.body.nombre;
            else {
                res.status(403);
                res.json({
                    error: "el nombre debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.genero != null) {
            if (req.body.genero.length >= 3) {
                cancion.genero = req.body.genero;
            } else {
                res.status(403);
                res.json({
                    error: "el género debe tener al menos 3 caracteres"
                })
            }

        }

        if (req.body.precio != null) {
            if (req.body.precio > 0) {
                cancion.precio = req.body.precio;
            } else {
                res.status(403);
                res.json({
                    error: "el precio de la canción debe ser mayor que 0"
                })
            }
        }

        gestorBD.obtenerOfertas(criterioCancion, function (canciones) {
            if (canciones == null || canciones[0].autor !== usuario) {
                res.status(403);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                gestorBD.modificarOferta(criterio, cancion, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error al modificar la canción"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje: "canción modificada",
                            _id: req.params.id
                        })
                    }
                });
            }
        });
    });

    app.post("/api/cancion", function (req, res) {

        let cancion = {};

        if (req.body.nombre != null) {
            if (req.body.nombre.length >= 3)
                cancion.nombre = req.body.nombre;
            else {
                res.status(403);
                res.json({
                    error: "el nombre debe tener al menos 3 caracteres"
                })
            }
        }

        if (req.body.genero != null) {
            if (req.body.genero.length >= 3) {
                cancion.genero = req.body.genero;
            } else {
                res.status(403);
                res.json({
                    error: "el género debe tener al menos 3 caracteres"
                })
            }

        }

        if (req.body.precio != null) {
            if (req.body.precio > 0) {
                cancion.precio = req.body.precio;
            } else {
                res.status(403);
                res.json({
                    error: "el precio de la canción debe ser mayor que 0"
                })
            }
        }

        gestorBD.insertarOferta(cancion, function (id) {
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