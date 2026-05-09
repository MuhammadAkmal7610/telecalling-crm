import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
@Roles('root', 'billing_admin', 'admin')
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        private readonly stripeService: StripeService,
    ) { }

    @Get('subscription')
    @ApiOperation({ summary: 'Get current subscription plan' })
    getSubscription(@CurrentUser() user: any) {
        return this.billingService.getSubscription(user.organizationId);
    }

    @Get('usage')
    @ApiOperation({ summary: 'Get seat usage and license info' })
    getUsage(@CurrentUser() user: any) {
        return this.billingService.getSeatUsage(user.organizationId);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get payment history' })
    getTransactions(@CurrentUser() user: any) {
        return this.billingService.getTransactions(user.organizationId);
    }

    @Post('upgrade')
    @ApiOperation({ summary: 'Upgrade / Update plan' })
    upgrade(@Body() body: { plan: string; users?: number }, @CurrentUser() user: any) {
        return this.billingService.updateSubscription(user.organizationId, body.plan, body.users);
    }

    @Post('checkout')
    @ApiOperation({ summary: 'Create Stripe checkout session' })
    createCheckout(@Body() body: { plan: string; quantity?: number }, @CurrentUser() user: any) {
        return this.stripeService.createCheckoutSession(
            user.organizationId, 
            body.plan, 
            user.email, 
            body.quantity || 1
        );
    }

    @Get('info')
    @ApiOperation({ summary: 'Get organization billing details' })
    getBillingInfo(@CurrentUser() user: any) {
        return this.billingService.getBillingInfo(user.organizationId);
    }

    @Patch('info')
    @ApiOperation({ summary: 'Update organization billing details' })
    updateBillingInfo(@Body() body: any, @CurrentUser() user: any) {
        return this.billingService.updateBillingInfo(user.organizationId, body);
    }

    @Post('webhook')
    @Roles('root', 'admin') // Ideally this should be public but verified by Stripe signature
    @ApiOperation({ summary: 'Stripe Webhook' })
    handleWebhook(@Body() body: any) {
        return this.billingService.handleStripeWebhook(body);
    }
}
