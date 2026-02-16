import { Inject, Provider } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

export const ProvideRepository = <Entities extends (new () => unknown)[]>(
  ...entities: Entities
) => {
  return entities.map(
    (x) =>
      ({
        provide: x.name + '__repository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(x),
        inject: [DataSource],
      }) satisfies Provider,
  );
};

export const InjectRepository = <T extends new () => unknown>(entity: T) =>
  Inject(entity.name + '__repository');

export function Transactional<
  T,
  K extends `${string}Transaction`,
  const P extends [manager: EntityManager, ...args: any[]],
>(dataSourceProp: string) {
  return (
    _: T,
    __: K,
    descriptor: TypedPropertyDescriptor<(...args: P) => Promise<any>>,
  ) => {
    const original = descriptor.value;
    if (typeof original !== 'function')
      throw new Error('Transactional only work on method');
    const fn = async function (this: never, ...args: unknown[]) {
      const firstArg = args[0];

      if (firstArg instanceof EntityManager) {
        return await original.apply(this, args);
      }

      const dataSource = this[dataSourceProp as never] as DataSource;
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      const manager = queryRunner.manager;
      args.unshift(manager);
      let result: unknown;

      await queryRunner.startTransaction();
      try {
        result = await original.apply(this, args);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

      return result;
    } as never;

    Object.defineProperty(fn, 'name', {
      value: original.name,
    });

    descriptor.value = fn;
  };
}

export const startTransaction = <
  T,
  K extends Extract<keyof T, `${string}Transaction`>,
  Fn extends T[K],
>(
  service: T,
  transaction: K,
  ...args: Fn extends (...args: any[]) => unknown
    ? Parameters<Fn> extends [EntityManager, ...infer Rest]
      ? Rest
      : never[]
    : never[]
): Fn extends (...args: any[]) => unknown
  ? Promise<Awaited<ReturnType<Fn>>>
  : never => {
  if (typeof service[transaction] !== 'function')
    throw new Error('Only method alowed for using start transaction');
  return service[transaction](...args);
};
