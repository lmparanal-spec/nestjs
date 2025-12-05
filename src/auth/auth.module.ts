import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

// Define a default expiration time in seconds (900 seconds = 15 minutes)
const DEFAULT_EXPIRATION_SECONDS = 900; 

@Module({
    imports: [
        UsersModule, 
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'yourStrongAccessSecretHere',
            signOptions: { 
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || '900s',
            },
        }),
    ],
    providers: [AuthService, JwtStrategy], 
    controllers: [AuthController],
})
export class AuthModule {}
