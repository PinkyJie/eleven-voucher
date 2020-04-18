import { SetMetadata } from '@nestjs/common';

export const PublicAccess = () => SetMetadata('isPublic', true);
