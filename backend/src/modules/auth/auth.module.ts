import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { SupabaseModule } from '../supabase/supabase.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        SupabaseModule,
        WorkspacesModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, SupabaseStrategy],
    exports: [AuthService],
})
export class AuthModule { }
