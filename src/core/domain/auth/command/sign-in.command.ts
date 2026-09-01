import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import type { IUserRepository } from '@infra/repositories/user.repository';
import type { ILogger } from '@infra/logger/logger';
import { JwtPayload } from '@shared/types';
import { NotFoundException } from '@shared/errors';
import { ObjectPack, StringPack } from '@shared/packs';

export class SignInCredentialsDto {
  @StringPack()
  accessToken: string;

  @StringPack()
  refreshToken: string;
}

export class SignInResponseDto {
  @ObjectPack(SignInCredentialsDto)
  credentials: SignInCredentialsDto;
}

export class SignInDto {
  @StringPack()
  username: string;

  @StringPack()
  password: string;
}

const tracer = trace.getTracer('sign-in-command');

@Injectable()
export class SignInCommand {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async execute(payload: SignInDto): Promise<SignInResponseDto> {
    const user = await this.userRepository.findByUsername(payload.username);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    const jwtPayload: JwtPayload = { sub: user.username || 'test' };

    const { accessToken, refreshToken } = await tracer.startActiveSpan(
      'sign-in-jwt',
      async (span) => {
        try {
          const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, { expiresIn: '1h' }),
            this.jwtService.signAsync(jwtPayload, { expiresIn: '7d' }),
          ]);

          span.setStatus({ code: SpanStatusCode.OK });

          return { accessToken, refreshToken };
        } finally {
          span.end();
        }
      },
    );

    this.logger.info('User signed in', { userId: user.id });

    return { credentials: { accessToken, refreshToken } };
  }
}
