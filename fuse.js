const { FuseBox } = require('./fuse-box');

let fuse = new FuseBox({
	log: true,
	debug: true,
	homeDir: 'src',
	output: 'build/$name.js'
});

fuse.bundle('test').instructions(`> index.tsx`).watch().hmr();
fuse.dev();
fuse.run();
