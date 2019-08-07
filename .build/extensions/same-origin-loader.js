"use strict";

/**
 * Лоудер для ситуаций, когда надо подгрузить js c фронтового сервера, а не со статики
 * Используется для sharedWorkerLoader поскольку он работает с политикой same-origin - такие js нельзя грузить с другого хоста
 *
 * @example WebpackSharedWorker = require("same-origin-loader!sharedworker-loader!./{name of ts file with worker code}}")
 *
 * @see /front/src/web/bums/common/browserTabs/transports/SharedWorkerTransport.ts
 *
 * @param source
 */
module.exports = function(source) {
    return source.replace("__webpack_public_path__", "\"/spa/\"")
};