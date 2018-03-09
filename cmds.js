const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

//Funciones que implementan los comandos.

/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log("  add - Añadir nuevo quiz iteractivamente.");
    log("  delete <id> - Borrar el quiz indicado.");
    log("  edit <id> - Editar el quiz indicado.");
    log("  test <id> - Probar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("  credits - Créditos.");
    log("  q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.listCmd = rl =>{

    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};


/**
 * Muestra el quiz indicado en el parametro: La pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.showCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};



/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 * Aquí esperamos al usuario a que conteste la pregunta y dé Enter. Comportamiento asíncrono.
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada
 * a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};


/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};



/**
 * Edita un quiz del modelo.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada
 * a rl.question.
 * @param id Clave del quiz a editar en el modelo.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.editCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{

            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });



        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};



/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.testCmd = (rl,id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{

            const quiz = model.getByIndex(id);
            rl.question(colorize(' ¿ '  + quiz.question + ' ? ', 'red'), respuesta => {

                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log('Su respuesta es correcta.');
                    biglog('CORRECTO', 'green');

                }else{
                    log('Su respuesta es incorrecta.');
                    biglog('INCORRECTO', 'red');
                }
                rl.prompt();
            });

        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {

    //Para almacenar las preguntas que se han ido acertando. Numero de aciertos totales.
    let score = 0;

    let toBeResolved = model.getAll();


    //Función jugar otra pregunta más. Función recursiva.
    const playOne = () => {

        //Si no hay ninguna más por resolver, se termina con el rl.prompt()
        if (toBeResolved.length === 0) {

            //Sacamos mensaje diciendo que no hay nada más que preguntar.
            log(` No hay nada más que preguntar.`);

            //Sacamos la puntación. El numero de aciertos.
            log(` Fin del juego. Aciertos: ${score} `);
            biglog(` ${score}`, 'magenta');

            //Para que el usuario meta otro comando.
            rl.prompt();

        }else {

            //Cogemos pregunta al azar del array toBeResolved usando Math.random().
            //Math.random() me da un numero aleatorio entre 0 y 1.
            //Con esta funcion, multiplico por el tamaño del array, y así me da numero
            //aleatorio que va desde 0 hasta el tamaño maximo del array. En esa posicion
            //tendré el id que a mi me interesa. Lo redondeamos para que me dé numero entero.
            let id = Math.floor(Math.random()*toBeResolved.length);

            //Voy a preguntar la pregunta asociada al id escogido aleatoriamente.
            let quiz = toBeResolved[id];

            //Y la quitamos del array, porque ya se habrá contestado.
            //Por ejemplo, si hacemos toBeResolved.splice(3,1), dejaría el array como "0 1 2 4"
            //No podemos usar model.deleteByIndex() porque afecta al json de las preguntas
            //y la eliminaríamos de ahí.
            toBeResolved.splice(id, 1);

            //Voy a hacer una pregunta del quiz que yo tengo, como en testCmd() y
            //voy a mirar si es correcta.
            rl.question(colorize(' ¿ ' + quiz.question + ' ? ', 'red'), respuesta => {

                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    score = score +1;
                    log(` CORRECTO - Lleva ${score} aciertos`);
                    //Llamada recursiva a playOne para que vuelva a jugar otra pregunta.
                    playOne();
                } else {
                    log(` INCORRECTO.`);
                    log(` Fin del juego. Aciertos: ${score} `);
                    biglog(` ${score}`, 'magenta');
                    rl.prompt();
                }

            });

        }
    };

    //Para que empieze el proceso. Aquí la llamo. Arriba, solo estaba definida.
    playOne();
};





/**
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Alejandra Fiol de Nicolás', 'green');
    log('Laura Diaz', 'green');
    rl.prompt();
};



/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.quitCmd = rl => {
    rl.close();
};

