import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ✅ Validate user credentials
  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    return { id: user.id, username: user.username, role: user.role };
  }

  // ✅ Login and issue access + refresh tokens
  async login(user: { id: number; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    // ✅ Generate Access Token (using JWT_SECRET)
    const accessToken = this.jwtService.sign(payload);

    // ✅ Generate Refresh Token (using a separate secret)
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      },
    );

    // ✅ Save refresh token in DB
    await this.usersService.setRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // ✅ Logout — clear refresh token
  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'User logged out successfully' };
  }

  // ✅ Refresh tokens securely
  async refreshTokens(refreshToken: string) {
    try {
      if (!refreshToken) throw new UnauthorizedException('No refresh token provided');

      // Verify refresh token
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      );

      // Fetch user by token
      const found = await this.usersService.findByRefreshToken(refreshToken);
      if (!found) throw new UnauthorizedException('Invalid or expired refresh token');

      // Issue new tokens
      const payload = { sub: found.id, username: found.username, role: found.role };
      const accessToken = this.jwtService.sign(payload);
      const newRefreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        },
      );

      // Save new refresh token
      await this.usersService.setRefreshToken(found.id, newRefreshToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}
