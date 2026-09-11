import handler from '../dist/main';

export default handler;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  (module.exports as any).default = handler;
}
