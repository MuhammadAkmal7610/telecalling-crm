import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SupabaseModule, 
        AuthModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secretString = configService.get<string>('SUPABASE_JWT_SECRET') || configService.get<string>('JWT_SECRET') || 'supersecret';
                const secretBuffer = Buffer.from(secretString, 'base64');
                return {
                    secret: secretBuffer,
                    signOptions: { expiresIn: '7d' },
                };
            },
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
