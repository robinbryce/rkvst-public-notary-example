import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	logLevel: 'debug',
	build: {
		rollupOptions: {
			external: ['@web3auth/modal']
		}
	},
	plugins: [sveltekit(), nodePolyfills({ protocolImports: true })],
	resolve: {
		alias: {
			$components: path.resolve('./src/lib/components')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
