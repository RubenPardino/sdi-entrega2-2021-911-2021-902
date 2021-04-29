module.exports = function(app, swig) {

    app.get('/autores/agregar', function (req, res) {

        let roles = [ {
            "rol" : "Guitarrista"
        }, {
            "rol" : "Cantante"
        }, {
            "rol" : "Teclista"
        }, {
            "rol" : "Batería"
        }, {
            "rol" : "Bajista"
        }];

        let respuesta = swig.renderFile('views/autores-agregar.html', {
            roles : roles
        });
        res.send(respuesta);
    })

    app.get("/autores", function(req, res) {

        let autores = [ {
            "nombre" : "Mateo",
            "grupo" : "Grupo 1",
            "rol" : "Guitarrista"
        }, {
            "nombre" : "Elias",
            "grupo" : "Grupo 2",
            "rol" : "Cantante"
        }, {
            "nombre" : "Joel",
            "grupo" : "Grupo 3",
            "rol" : "Teclista"
        } ];

        let respuesta = swig.renderFile('views/autores.html', {
            autores : autores
        });

        res.send(respuesta);
    });

    app.get('/autores/filtrar/:rol', function(req, res) {

        let autores = [ {
            "nombre" : "Mateo",
            "grupo" : "Grupo 1",
            "rol" : "Guitarrista"
        }, {
            "nombre" : "Elias",
            "grupo" : "Grupo 2",
            "rol" : "Cantante"
        }, {
            "nombre" : "Joel",
            "grupo" : "Grupo 3",
            "rol" : "Teclista"
        } ];

        let respuesta = "";

        for (let autor of autores) {
            if (autor.rol === req.params.rol) {
                respuesta += autor.nombre + '<br>';
            }
        }
        res.send(respuesta);
    });

    app.get('/autores*', function (req, res) {
        res.redirect("/autores");
    })

    app.post('/autores/agregar', function (req, res) {
        res.send("Autor agregado: " + req.body.nombre + "<br>"
            + " Grupo: " + req.body.grupo + "<br>"
            + " Rol: " + req.body.rol);
    })
};