// Borrowed from https://github.com/NoHomey/bind-decorator
// via https://github.com/statelyai/xstate/blob/231a6eb1dd47d05b8bf37181e435bb2d99afdeac/packages/core/src/utils.ts#L737
export default function bind(target, propertyKey, descriptor) {
  if (!descriptor || (typeof descriptor.value !== 'function')) {
    throw new TypeError(
      `Only methods can be decorated with @bind. <${propertyKey}> is not a method!`
    );
  }
  return {
    configurable: true,
    get: function () {
      const bound = descriptor.value.bind(this);
      // Credits to https://github.com/andreypopp/autobind-decorator for
      // memoizing the result of bind against a symbol on the instance.
      Object.defineProperty(this, propertyKey, {
          value: bound,
          configurable: true,
          writable: true
      });
      return bound;
    }
  };
}
