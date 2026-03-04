import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
@Roles('root', 'billing_admin')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('subscription')
    @ApiOperation({ summary: 'Get current subscription plan' })
    getSubscription(@CurrentUser() user: any) {
        return this.billingService.getSubscription(user.organizationId);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get payment history' })
    getTransactions(@CurrentUser() user: any) {
        return this.billingService.getTransactions(user.organizationId);
    }

    @Post('upgrade')
    @ApiOperation({ summary: 'Upgrade / Update plan' })
    upgrade(@Body() body: { plan: string }, @CurrentUser() user: any) {
        return this.billingService.updateSubscription(user.organizationId, body.plan);
    }
}
