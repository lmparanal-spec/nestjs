import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken'; // ⬅️ IMPORT KEPT

@Injectable()
export class AuthService {
    // Defined once, used consistently
    private readonly REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret';
    private readonly REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    constructor(private usersService: UsersService, private jwtService: JwtService) {}
    
    // --- User Validation (No Change) ---
    async validateUser(username: string, pass: string) {
        const user = await this.usersService.findByUsername(username);
        console.log('Found user:', user);
        if (!user) return null;

        const valid = await bcrypt.compare(pass, user.password);
        console.log('Password valid?', valid);
        if (valid) return { id: user.id, username: user.username, role: user.role };
        return null;
    }

    // --- Login (Generates Tokens) ---
    async login(user: { id: number; username: string; role: string }) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        
        const accessToken = this.jwtService.sign(payload);
    
        // FIX for 'No overload matches' is already here via 'as jwt.SignOptions'
        const refreshToken = jwt.sign(
            payload, 
            this.REFRESH_SECRET, 
            { 
                expiresIn: this.REFRESH_EXPIRES_IN,
            } as jwt.SignOptions
        );

        await this.usersService.setRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken };
    }

    // --- Logout (No Change) ---
    async logout(userId: number) {
        await this.usersService.setRefreshToken(userId, null);
        return { ok: true };
    }
    
    // --- Token Refresh ---
    async refreshTokens(refreshToken: string) {
        try {
            // Verification is correct with jwt.verify()
            const decoded: any = jwt.verify(refreshToken, this.REFRESH_SECRET);
            
            // Cleaned up redundant user lookups
            const found = await this.usersService.findByRefreshToken(refreshToken);
            if (!found || found.id !== decoded.sub) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const payload = { sub: found.id, username: found.username, role: found.role };
            
            const accessToken = this.jwtService.sign(payload);
            
            // FIX for 'No overload matches' is already here via 'as jwt.SignOptions'
            const newRefresh = jwt.sign(
                payload, 
                this.REFRESH_SECRET, 
                { 
                    expiresIn: this.REFRESH_EXPIRES_IN, 
                } as jwt.SignOptions
            );
            
            await this.usersService.setRefreshToken(found.id, newRefresh);
            
            return { accessToken, refreshToken: newRefresh };
        } catch (err) {
            // ⬅️ FIX APPLIED HERE: Check if 'err' is an Error object before accessing 'message'
            if (err instanceof Error) {
                console.error('Refresh Token Error:', err.message);
            } else {
                console.error('An unknown error occurred during token refresh.');
            }
            throw new UnauthorizedException('Could not refresh tokens');
        }
    }
}
