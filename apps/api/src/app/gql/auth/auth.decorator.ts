import { SetMetadata } from '@nestjs/common';

export const PublicAccess = () => SetMetadata('isPublic', true);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
