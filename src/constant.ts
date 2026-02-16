export const REPOSITORY = {
  _DATA_SOURCE: 'DATA_SOURCE',
};

export const AUTH = {
  IS_PUBLIC: 'IS_PUBLIC',
  USED_PERMISSION: 'AUTH_USED_PERMISSION',
};

export const PERMISSION = {
  SUPER_USER: 0x01,
  ADMIN: 0x02,
  KARYAWAN: 0x04,
} as const;
