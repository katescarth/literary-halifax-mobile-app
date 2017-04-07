/**
 * rollup with babel
 */

import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';

export default {
 	entry: './src/main.js',
 	dest: './dist/worker-browser.js',
    exports: 'named',
    format: 'umd',
    moduleName: 'NbBlobWorker',
 	plugins: [
 		babel(),
        cleanup()
 	]
};
