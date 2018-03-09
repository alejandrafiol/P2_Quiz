
const figlet = require('figlet');
const chalk = require('chalk');


/**
 * Dar color a un string.
 *
 * @param msg Es el string al que hay que dar color.
 * @param color Color que vamos a usar para pintar el mensaje.
 * @returns {string} Devuelve el string con el color indicado.
 */

const colorize = (msg, color) => {
    if (typeof color !== "undefined") {
        msg = chalk[color].bold(msg);
    }
    return msg;
};


/**
 * Escribe mensaje de log.
 *
 * @param msg El string a escribir.
 * @param color Color del texto.
 */

const log = (msg, color) => {
    console.log(colorize(msg, color));
};


/**
 * Escribe mensaje de log grande.
 *
 * @param msg El string a escribir.
 * @param color Color del texto.
 */

const biglog = (msg, color) => {
    log(figlet.textSync(msg, { horizontalLayout: 'full' }), color);
};


/**
 * Escribe mensaje de error emsg.
 *
 * @param emsg Texto del mensaje de error.
 */

const errorlog = (emsg) => {
    console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);

};

// Objeto exportar. Definido para las funciones de este modulo.
exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};