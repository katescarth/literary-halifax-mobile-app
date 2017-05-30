/**
 * rollup with babel
 */

import babel from 'rollup-plugin-babel';
import cleanup from 'rollup-plugin-cleanup';

export default {
 	entry: './test/map.js',
 	dest: './test/map.test.js',
    // exports: 'named',
    // moduleName: 'NbBlobWorker',
 	// format: 'cjs',
 	plugins: [
 		babel(),
        cleanup()
 	]
};
