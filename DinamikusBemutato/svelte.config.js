import adapter from '@sveltejs/adapter-node';
// if you had adapter-auto imported before, remove that line

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;
