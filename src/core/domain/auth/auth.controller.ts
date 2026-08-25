import { Controller, Post, Body } from '@nestjs/common';
import {
  SignInCommand,
  SignInDto,
  SignInResponseDto,
} from './command/sign-in.command';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller({ path: 'v1/auth' })
export class AuthController {
  constructor(private readonly signInCommand: SignInCommand) {}

  @Post('sign-in')
  @ApiOkResponse({ type: SignInResponseDto })
  async signIn(@Body() body: SignInDto) {
    return this.signInCommand.execute(body);
  }
}
