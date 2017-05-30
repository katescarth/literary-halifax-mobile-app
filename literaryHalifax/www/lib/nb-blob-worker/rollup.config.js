/**
 * rollup with babel
 */

import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';

export default {
 	entry: './src/main.js',
 	dest: './dist/worker.cjs.js',
    exports: 'named',
    moduleName: 'NbBlobWorker',
 	format: 'cjs',
 	plugins: [
 		babel(),
        cleanup()
 	]
};
