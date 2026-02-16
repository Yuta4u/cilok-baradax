export const FilterCatch =
  <Arguments extends ((error: unknown) => unknown)[]>(
    ...errorCatchers: Arguments
  ) =>
  (_: unknown, __: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    if (typeof original !== 'function')
      throw new Error('Catch is not applied on method');
    descriptor.value = async function (...args: unknown[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        for (const catcher of errorCatchers) {
          const result = await catcher(error);
          if (result !== undefined && result !== null) throw result;
        }
        throw error;
      }
    };
  };
