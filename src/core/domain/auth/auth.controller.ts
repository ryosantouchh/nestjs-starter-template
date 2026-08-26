import { Controller, Post, Body } from '@nestjs/common';
import {
  SignInCommand,
  SignInDto,
  SignInResponseDto,
} from './command/sign-in.command';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignUpCommand, SignUpDto } from './command/sign-up.command';

@Controller({ path: 'v1/auth' })
export class AuthController {
  constructor(
    private readonly signInCommand: SignInCommand,
    private readonly signUpCommand: SignUpCommand,
  ) {}

  @Post('sign-in')
  @ApiOkResponse({ type: SignInResponseDto })
  async signIn(@Body() body: SignInDto) {
    return this.signInCommand.execute(body);
  }

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    await this.signUpCommand.execute(body);
  }
}
