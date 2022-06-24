const propertiesSymbol = Symbol("properties");

/**
 * Reactive decorator that calls the `render()` function when the value of the property change.
 */
export default function reactive() {
  return (protoOrDescriptor: any, name: PropertyKey): any => {
    Object.defineProperty(protoOrDescriptor, name, {
      get() {
        const map = Reflect.get(protoOrDescriptor, propertiesSymbol) || {};
        return map[name];
      },
      set(newValue) {
        let map = Reflect.get(protoOrDescriptor, propertiesSymbol);
        if (!map) {
          map = {};
          Reflect.set(protoOrDescriptor, propertiesSymbol, map);
        }
        if (map[name] === name) {
          return;
        }
        if (newValue === undefined) {
          delete map[name];
        } else {
          map[name] = newValue;
        }
        if (typeof this.render === 'function') {
          this.render();
        }
      },
      enumerable: true,
      configurable: true,
    });
  };
}
