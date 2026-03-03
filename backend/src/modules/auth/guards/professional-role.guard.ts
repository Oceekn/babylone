import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';
import { ProfessionalsService } from '../../professionals/professionals.service';

@Injectable()
export class ProfessionalRoleGuard implements CanActivate {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.PROFESSIONAL || user.role === UserRole.ADMIN) {
      return true;
    }

    const professional = await this.professionalsService.findByUserId(user.id);
    if (professional) {
      return true;
    }

    throw new ForbiddenException('Only professionals can access this resource');
  }
}

