import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // ✅ Get all users (PUBLIC)
    @Get()
    async getAll() {
        return this.usersService.getAll();
    }

    // ✅ Get single user by ID (PUBLIC)
    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }

    // ✅ Create user (PUBLIC)
    @Post()
    async create(@Body() body: { username: string; password: string; contact_number: string }) {
        return this.usersService.createUser(body.username, body.password, body.contact_number);
    }

    // 🔒 Update user (STILL PROTECTED)
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.usersService.updateUser(+id, body);
    }

    // 🔒 Delete user (STILL PROTECTED)
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.usersService.deleteUser(+id);
    }
}
