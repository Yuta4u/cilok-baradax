export function DisableOnDevelopment<
  T,
  Key extends string,
  Desc extends (...args: any[]) => unknown,
>(fallback?: (...args: Parameters<Desc>) => ReturnType<Desc>) {
  return function (_: T, __: Key, descriptor: TypedPropertyDescriptor<Desc>) {
    // Ensure descriptor.value exists and is a function
    if (!descriptor.value || typeof descriptor.value !== 'function') {
      throw new Error('Decorator can only be applied to methods');
    }

    const original = descriptor.value;

    descriptor.value = function (
      this: T,
      ...args: Parameters<Desc>
    ): ReturnType<Desc> {
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        return original.apply(this, args) as ReturnType<Desc>;
      }

      // Development mode
      if (fallback) {
        return fallback(...args);
      }

      // If no fallback provided, you have options:
      // Option 1: Still execute original (current behavior fix)
      // return original.apply(this, args) as ReturnType<Desc>;

      // Option 2: Return undefined/null (be explicit about it)
      return undefined as ReturnType<Desc>;

      // Option 3: Throw an error
      // throw new Error(`Method ${String(__)} is disabled in development`);

      // Option 4: Return a default value based on return type
      // return getDefaultValue<ReturnType<Desc>>();
    } as Desc;

    // Preserve original function name
    Object.defineProperty(descriptor.value, 'name', {
      value: original.name,
      configurable: true,
    });

    return descriptor;
  };
}

// Alternative version with more explicit behavior
export function DisableOnDevelopmentStrict<
  T,
  Key extends string,
  Desc extends (...args: any[]) => unknown,
>(
  options: {
    fallback?: (...args: Parameters<Desc>) => ReturnType<Desc>;
    throwOnDev?: boolean;
    message?: string;
  } = {},
) {
  const { fallback, throwOnDev = false, message } = options;

  return function (
    _: T,
    propertyKey: Key,
    descriptor: TypedPropertyDescriptor<Desc>,
  ) {
    if (!descriptor.value || typeof descriptor.value !== 'function') {
      throw new Error('Decorator can only be applied to methods');
    }

    const original = descriptor.value;

    descriptor.value = function (
      this: T,
      ...args: Parameters<Desc>
    ): ReturnType<Desc> {
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        return original.apply(this, args) as ReturnType<Desc>;
      }

      // Development mode
      if (throwOnDev) {
        throw new Error(
          message || `Method ${String(propertyKey)} is disabled in development`,
        );
      }

      if (fallback) {
        return fallback(...args);
      }

      // Default: no-op, return undefined

      console.warn(
        `Method ${String(propertyKey)} was called in development mode but is disabled`,
      );
      return undefined as ReturnType<Desc>;
    } as Desc;

    Object.defineProperty(descriptor.value, 'name', {
      value: original.name,
      configurable: true,
    });

    return descriptor;
  };
}
