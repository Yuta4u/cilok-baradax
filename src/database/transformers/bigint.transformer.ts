import { Column, ColumnOptions, ValueTransformer } from 'typeorm';

export const BigIntTransformer: ValueTransformer = {
  to: (value) => value,
  from: (value) => (value === null ? null : parseInt(value)),
};

export const BigIntColumn = ({ ...options }: Omit<ColumnOptions, 'type'>) =>
  Column({
    type: 'bigint',
    transformer: BigIntTransformer,
    ...options,
  });

export const FloatingTransformer: ValueTransformer = {
  to: (value) => value,
  from: (value) => (value === null ? null : parseFloat(value)),
};

export const FloatingColumn = ({ ...options }: Omit<ColumnOptions, 'type'>) =>
  Column({
    type: 'double precision',
    transformer: FloatingTransformer,
    ...options,
  });
