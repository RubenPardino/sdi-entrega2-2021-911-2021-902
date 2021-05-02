module.exports = function (app, swig, gestorBD) {

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.send("Usuario desconectado");
    });

    app.get('/error', function (req, res) {
        let respuesta = swig.renderFile('views/error.html', {})
        res.send(respuesta);
    });

    app.post('/usuario', function (req, res) {
        if (req.body.password !== req.body.password2)
            res.redirect("/error" +
                "?mensaje=Las contraseñas no coinciden" +
                "&tipoMensaje=alert-danger ");

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let usuario = {
            email: req.body.email,
            password: seguro,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            saldo: 100
        }

        gestorBD.insertarUsuario(usuario, function (id) {
            if (id == null) {
                res.redirect("/error" +
                    "?mensaje=Error al registrar usuario" +
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
            }
        });
    });

    app.get("/usuarios", function (req, res) {

        let criterio = {}

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/error" +
                    "?mensaje=Error al obtener usuarios" +
                    "&tipoMensaje=alert-danger ");
            } else {
                let respuesta = swig.renderFile('views/usuarios.html', {
                    usuarios: usuarios
                });

                res.send(respuesta);
            }
        });
    });

    app.get('/usuario/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarUsuario(criterio, function (usuario) {
            if (usuario == null) {
                res.send(respuesta);
            } else {
                res.redirect("/usuarios");
            }
        });
    })

    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/error" +
                    "?mensaje=Email o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/publicaciones");
            }
        });
    });

};