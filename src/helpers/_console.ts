import { name } from "../../package.json";

const getKeyColor = (key: string) => {
  switch (key) {
    case "log":
      return "blue";
    case "info":
      return "green";
    case "error":
      return "red";
    default:
      return "black";
  }
};

const getConsole = () => {
  const proxy = new Proxy(console, {
    get(target, key) {
      // @ts-ignore
      const prop = target[key];

      if (typeof prop === "function") {
        return (...args: unknown[]) => {
          for (const arg of args) {
            try {
              prop(
                `%c${String(key)}: %c[EXTENSION %c${name}] %c${typeof arg === "string" ? arg : JSON.stringify(arg)}`,
                `color: ${getKeyColor(String(key))}`,
                "color: black",
                "color: gray",
                "color: black"
              );
            } catch {
              prop(...args);
            }
          }
        };
      }

      return prop;
    }
  });

  return proxy;
};

const _console = getConsole();

export default _console;
