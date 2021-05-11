module.exports = function (app, swig, gestorBD) {

    var rolEnum = {
        ADMIN: 0,
        ESTANDAR: 1,
        ANONIMO: 2
    }

    /*
        Método que te redirige a la vista de registro
    */
    app.get("/registrarse", function (req, res) {
        res.send(app.get('returnVista')(req, 'bregistro.html', null));
    });

    /*
        Método que te redirige a la vista de logeo
    */
    app.get("/identificarse", function (req, res) {
        res.send(app.get('returnVista')(req, 'bidentificacion.html', null));
    });

    /*
        Método para desconectarse de sesión que te redirige al método /identificarse
    */
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        req.session.saldo = null;
        req.session.rol = rolEnum.ANONIMO;
        res.redirect("/identificarse");
    });

    /*
        Método que te redirige a la página de error
    */
    app.get('/error', function (req, res) {
        res.send(app.get('returnVista')(req, 'error.html', null));
    });

    /*
        Método que te redirige a la lista de usuarios (solo si eres administrador)
    */
    app.get("/usuarios", function (req, res) {

        let criterio = {}

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                req.session.saldo = null;
                req.session.rol = rolEnum.ANONIMO;
                res.redirect("/error" +
                    "?mensaje=Error al obtener usuarios" +
                    "&tipoMensaje=alert-danger ");
            } else {
                res.send(app.get('returnVista')(req, 'usuarios.html', usuarios));
            }
        });
    });

    /*
        Método que te elimina el usuario que tenga la id que se le pasa por parámetro
    */
    app.get('/usuario/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.eliminarUsuario(criterio, function (usuario) {
            if (usuario == null) {
                res.redirect("/error" +
                    "?mensaje=No existe un usuario con esa id" +
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/usuarios");
            }
        });
    })

    /*
        Método post que te registra en la base de datos y te logea directamente, redirigiendote a /publicaciones
    */
    app.post('/usuario', function (req, res) {
        if (req.body.password !== req.body.password2)
            res.redirect("/error" +
                "?mensaje=Las contraseñas no coinciden" +
                "&tipoMensaje=alert-danger ");
        else {

            let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');

            let usuario = {
                email: req.body.email,
                password: seguro,
                nombre: req.body.nombre,
                apellidos: req.body.apellidos,
                saldo: 100,
                rol: rolEnum.ESTANDAR
            }
            let criterio = {
                email: req.body.email,
                password: seguro
            }
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios == null || usuarios.length == 0 ) {
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.redirect("/error" +
                                "?mensaje=Error al registrar usuario" +
                                "&tipoMensaje=alert-danger ");
                        } else {
                            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                                if (usuarios == null || usuarios.length == 0) {
                                    req.session.usuario = null;
                                    req.session.saldo = null;
                                    req.session.rol = rolEnum.ANONIMO;
                                    res.redirect("/error" +
                                        "?mensaje=Email o password incorrecto" +
                                        "&tipoMensaje=alert-danger ");
                                } else {
                                    req.session.usuario = usuarios[0].email;
                                    req.session.saldo = usuarios[0].saldo;
                                    req.session.rol = usuarios[0].rol;
                                    res.redirect("/publicaciones");
                                }
                            });
                        }
                    });
                } else {
                    res.redirect("/error" +
                        "?mensaje=Usuario ya registrado anteriormente" +
                        "&tipoMensaje=alert-danger ");
                }
            })
        }
    });

    /*
        Método post que te identifica y te redirige, si eres administrador a /usuarios, y si no a /publicaciones
    */
    app.post("/identificarse", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length === 0) {
                req.session.usuario = null;
                req.session.saldo = null;
                req.session.rol = rolEnum.ANONIMO;
                res.redirect("/error" +
                    "?mensaje=Email o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.saldo = usuarios[0].saldo;
                req.session.rol = usuarios[0].rol;
                if (usuarios[0].email === "admin@email.com")
                    res.redirect("/usuarios")
                else
                    res.redirect("/publicaciones");
            }
        });
    });

};