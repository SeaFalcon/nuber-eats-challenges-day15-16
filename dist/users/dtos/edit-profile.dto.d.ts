import { User } from '../entities/user.entity';
import { CoreOutput } from './output.dto';
declare const EditProfileInput_base: import("@nestjs/common").Type<Partial<Pick<User, "id" | "createdAt" | "updatedAt" | "email" | "password" | "role" | "hashPassword" | "checkPassword">>>;
export declare class EditProfileInput extends EditProfileInput_base {
}
export declare class EditProfileOutput extends CoreOutput {
}
export {};
