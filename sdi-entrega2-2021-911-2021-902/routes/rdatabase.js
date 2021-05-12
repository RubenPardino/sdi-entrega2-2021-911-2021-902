module.exports = function (app, gestorBD) {
    /*
        Método que reinicia la base de datos para los tests
    */
    app.get("/bdreset", function (req, res) {
        gestorBD.borrarDatos(function (result) {
            if (result == null) {
                res.send("Error al borrar los datos");
            } else {
                let seguroAdmin = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update("admin").digest('hex');

                let admin = {
                    email: "admin@email.com",
                    password: seguroAdmin,
                    nombre: "admin",
                    apellidos: "admin",
                    saldo: 100,
                    rol: 0
                }

                gestorBD.insertarUsuario(admin, function (result) {
                    if (result == null) {
                        res.send("Error al introducir datos");
                    } else {
                        //Aquí van los datos que se meten en la base de datos para los tests
                        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                            .update("1234").digest('hex');


                        let usuario0 = {
                            email: "usuario0@gmail.com",
                            password: seguro,
                            nombre: "usuario0",
                            apellidos: "usuario0",
                            saldo: 100,
                            rol: 1
                        }

                        let usuario1 = {
                            email: "usuario1@gmail.com",
                            password: seguro,
                            nombre: "usuario1",
                            apellidos: "usuario1",
                            saldo: 100,
                            rol: 1
                        }

                        let usuario2 = {
                            email: "usuario2@gmail.com",
                            password: seguro,
                            nombre: "usuario2",
                            apellidos: "usuario2",
                            saldo: 100,
                            rol: 1
                        }

                        let usuario3 = {
                            email: "usuario3@gmail.com",
                            password: seguro,
                            nombre: "usuario3",
                            apellidos: "usuario3",
                            saldo: 100,
                            rol: 1
                        }

                        //Usuarios que se quedará en la base de datos después de las pruebas de borrado de usuarios con el admin
                        let usuario4 = {
                            email: "test1@gmail.com",
                            password: seguro,
                            nombre: "Juan",
                            apellidos: "Diaz",
                            saldo: 100,
                            rol: 1
                        }

                        let usuario5 = {
                            email: "test2@gmail.com",
                            password: seguro,
                            nombre: "Marcos",
                            apellidos: "Caraduje",
                            saldo: 100,
                            rol: 1
                        }
                        let usuario6 = {
                            email: "destaca@gmail.com",
                            password: seguro,
                            nombre: "Destaca",
                            apellidos: "Mucho",
                            saldo: 59,
                            rol: 1
                        }

                        let seguroAdmin = app.get("crypto").createHmac('sha256', app.get('clave'))
                            .update("admin").digest('hex');

                        let admin = {
                            email: "admin@email.com",
                            password: seguroAdmin,
                            nombre: "admin",
                            apellidos: "admin",
                            saldo: 100,
                            rol: 0
                        }

                        let usuarios = [usuario0, usuario1, usuario2, usuario3, usuario4, usuario5, usuario6, admin];

                        gestorBD.insertarUsuario(usuarios, function (result2) {
                            if (result2 == null) {
                                res.send("Error al introducir datos");
                            } else {

                                let oferta0 = {
                                    titulo: "oferta0",
                                    precio: 10,
                                    detalles: "detalles de la oferta 0",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "test1@gmail.com",
                                    destacada: false
                                }

                                //Ofertas que se quedarán tras hacer los tests de eliminar ofertas
                                let oferta1 = {
                                    titulo: "Coche",
                                    precio: 92,
                                    detalles: "detalles del coche",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "test1@gmail.com",
                                    destacada: false
                                }

                                let oferta2 = {
                                    titulo: "Peluche",
                                    precio: 8,
                                    detalles: "detalles del peluche",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "test1@gmail.com",
                                    destacada: false
                                }

                                let oferta3 = {
                                    titulo: "Diamante",
                                    precio: 1000000,
                                    detalles: "detalles del diamante",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "test1@gmail.com",
                                    destacada: false
                                }

                                let oferta4 = {
                                    titulo: "Destacado",
                                    precio: 50,
                                    detalles: "detalles del destacado",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "destaca@gmail.com",
                                    destacada: false
                                }

                                let oferta5 = {
                                    titulo: "Comenta",
                                    precio: 30,
                                    detalles: "detalles del comenta",
                                    fecha: new Date().toISOString().slice(0, 10),
                                    autor: "destaca@gmail.com",
                                    destacada: false
                                }

                                let ofertas = [oferta0, oferta1, oferta2, oferta3, oferta4, oferta5];

                                gestorBD.insertarOferta(ofertas, function (result3) {
                                    if (result3 == null) {
                                        res.send("Error al introducir datos");
                                    } else {
                                        let criterioOferta = { titulo: { $in: ["Diamante", "Destacado", "Comenta"] } }

                                        gestorBD.obtenerOfertas(criterioOferta, function (ofertas) {
                                            if (ofertas == null) {
                                                res.send("Error al introducir datos");
                                            } else {

                                                let mensajes = [];

                                                for (let oferta of ofertas) {
                                                    let mensaje = {
                                                        receptor: oferta.autor,
                                                        emisor: "test2@gmail.com",
                                                        oferta: oferta._id.toString(),
                                                        fecha: Date.now(),
                                                        mensaje: "Mensaje de prueba",
                                                        leido: false
                                                    }
                                                    mensajes.push(mensaje);
                                                }

                                                gestorBD.insertarComentario(mensajes, function (result4) {
                                                    if (result4 == null) {
                                                        res.send("Error al introducir datos");
                                                    } else {
                                                        app.get('logger').debug("Base de datos reiniciada");
                                                        res.send("Datos para test insertados");
                                                    }
                                                })
                                            }
                                        })

                                    }
                                })
                            }
                        })
                    }
                })

            }
        });
    })
}